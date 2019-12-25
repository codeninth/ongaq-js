import AudioCore from "./AudioCore"
import Helper from "./Helper"
import * as filterMapper from "../plugin/filtermapper/index"
import BufferYard from "./BufferYard"
import DEFAULTS from "./defaults"

const context = AudioCore.context


class Part {

    constructor(props = {}){
        this.sound = props.sound
        this.id = props.id || Helper.getUUID()
        this.tags = Array.isArray(props.tags) ? props.tags : []
        this.bpm = props.bpm
        this.measure = props.measure

        this.willMakeLap = props && typeof props.willMakeLap === "function" && props.willMakeLap
        /*
            maxLap:
            if the lap would be over maxLap, this Part stops (repeat: false) or its lap returns to 0 (repeat: true)
        */
        this.maxLap = (typeof props.maxLap === "number" && props.maxLap >= 0 ) ? props.maxLap : Infinity
        this.repeat = props.repeat !== false

        this._isLoading = false
        this._beatsInMeasure = props._beatsInMeasure
        this._currentBeatIndex = 0

        /*
            @_nextBeatTime
            - time for next notepoint
            - updated with AudioContext.currentTime
        */
        this._nextBeatTime = 0

        /*
            @lap
            - get added 1 when all beats are observed
        */
        this._lap = 0

        /*
            @_beatQuota
            - how many beats to observe before changing to not active
        */
        this._beatQuota = 0

        /*
            @_consumedBeats
            - observed beats
        */
        this._consumedBeats = 0

        /*
            @attachment
            - conceptual value: user would be able to handle any value to part with this
        */
        this._attachment = {}

        this.default = {}
        this.default.active = props.active !== false
        this.active = false
        this.mute = !!props.mute

        this._putTimerRight()

        this.collect = this.collect.bind(this)
    }

    add(newFilter){
        if(!newFilter || !newFilter.priority || newFilter.priority === -1) return false

        this.filters = this.filters || []
        this.filters.push(newFilter)
        this.filters.sort((a,b)=>{
            if(a.priority > b.priority) return 1
            else if(a.priority < b.priority) return -1
            else return 0
        })

        this._generator = () => {

            this._targetBeat = this._targetBeat || {}
            this._targetBeat.sound = this.sound
            this._targetBeat.measure = Math.floor(this._currentBeatIndex / this._beatsInMeasure)
            this._targetBeat.beatIndex = this._currentBeatIndex % this._beatsInMeasure
            this._targetBeat.beatTime = this._nextBeatTime
            this._targetBeat.secondsPerBeat = this._secondsPerBeat
            this._targetBeat.lap = this._lap
            this._targetBeat.attachment = this._attachment

            let hasNote = false
            let mapped = []
            this.filters.forEach((_filter)=>{
                if(
                    !Object.hasOwnProperty.call(filterMapper, _filter.type) ||
                    ( _filter.type !== "note" && !hasNote )
                ){ return false }
                const mappedFunction = filterMapper[_filter.type](_filter.params, this._targetBeat )
                if (mappedFunction){
                    if (_filter.type === "note") hasNote = true
                    mapped.push( mappedFunction )
                }
            })
            return mapped.reduce((accumulatedResult, currentFunction) => {
                return currentFunction(accumulatedResult)
            }, filterMapper.empty()())
        }
        this._generator = this._generator.bind(this)
        return false
    }

    attach(data = {}) {
        this._attachment = Object.assign(this._attachment, data)
    }

    collect(){

        let collected

        /*
            keep _nextBeatTime being always behind secondToPrefetch
        */
        let secondToPrefetch = context.currentTime + DEFAULTS.PREFETCH_SECOND
        while (
            this._nextBeatTime - secondToPrefetch > 0 &&
            this._nextBeatTime - secondToPrefetch < DEFAULTS.PREFETCH_SECOND
        ){
            secondToPrefetch += DEFAULTS.PREFETCH_SECOND
        }
        /*
          if this._endTime is scheduled and secondToPrefetch will be overlap, this Part must stop
        */
        if(this._endTime && this._endTime < secondToPrefetch){
          this._shutdown()
        }

        /*
            collect soundtrees for notepoints which come in certain range
            */
        while (this.active && this._nextBeatTime < secondToPrefetch){
            if(this._consumedBeats >= this._beatQuota) break

            let element = !this.mute && this._generator()
            if(element){
                collected = collected || []
                collected = collected.concat(element)
            }

            this._nextBeatTime += this._secondsPerBeat

            if(this._currentBeatIndex + 1 >= this.measure * this._beatsInMeasure){

                this._currentBeatIndex = 0
                this._lap++
                typeof this.willMakeLap === "function" && this.willMakeLap({
                    nextLap: this._lap,
                    meanTime: this._nextBeatTime
                })
                if(this._lap > this.maxLap){
                    if (this.repeat) this.resetLap()
                    else this.out()
                }

            } else {
                this._currentBeatIndex++
            }

            if(++this._consumedBeats >= this._beatQuota){
                this.active = false
                break
            }
        }
        return collected

    }

    detach(field) {
        if (typeof field === "string") delete this._attachment[field]
        else this._attachment = {}
    }

    in(meanTime){
        if(typeof meanTime !== "number" || meanTime <= context.currentTime ){
            throw new Error("assign a number for the first argument for Part.in( )")
        }
        if(this.active) return false
        this._meanTime = meanTime
        this._nextBeatTime = meanTime
        this.default.active = true // once in() called, this Part should be paused / restarted as usual
        this.active = true
        return false
    }

    async loadSound(){
        this._isLoading = true
        return new Promise( async (resolve,reject)=>{
            try {
                await BufferYard.import(this.sound)
                this._isLoading = false
                this.active = this.default.active
                resolve()
            } catch(e) {
                this._isLoading = false
                this._loadingFailed = true
                reject(e)
            }
        })
    }

    out(endTime,overwrite = false){
        if(!this.active) return false
        if(this._endTime){
            // this._endTime is already set.
            if(overwrite && endTime && endTime > context.currentTime) this._endTime = endTime
        } else {
            // if suitable _endTime is not assigned, shutdown immediately.
            if(endTime && endTime > context.currentTime) this._endTime = endTime
            else this._shutdown()
        }
        return false
    }

    /*
        @tag
        tags: A,B,C...
        add tag A, tag B, tag C...
        */
    tag(...tags) {
        this.tags = Array.isArray(this.tags) ? this.tags : []
        tags.forEach(tag => {
            if (!this.tags.includes(tag)) this.tags.push(tag)
        })
    }

    removeTag(...tags){
        this.tags = Array.isArray(this.tags) ? this.tags : []
        this.tags = this.tags.filter(tag=>{
            return !tags.includes(tag)
        })
    }

    resetLap(){
        this._lap = 0
    }

    set mute(v) {
        if (typeof v === "boolean") this._mute = v
    }
    get mute() { return this._mute }

    set bpm(v) {
        let bpm = Helper.toInt(v, { max: DEFAULTS.MAX_BPM, min: DEFAULTS.MIN_BPM })
        if (bpm) this._bpm = bpm
    }
    get bpm() { return this._bpm }

    _shutdown(){
      if(!this.active) return false
      this._meanTime = 0
      this._endTime = 0
      this._nextBeatTime = 0
      this.active = false
    }

    _putTimerRight(_meanTime){
        if (!this.active) return false
        this._nextBeatTime = _meanTime || context.currentTime
    }

    _reset(){
        this._lap = 0
        this._currentBeatIndex = 0
        this._consumedBeats = 0
        this._beatQuota = 0
    }

    _setQuota(totalCap){
        this._beatQuota = totalCap * this._beatsInMeasure
    }

    get _secondsPerBeat(){ return 60 / this._bpm / 8 }

}

export default Part
