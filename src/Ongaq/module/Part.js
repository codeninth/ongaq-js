import AudioCore from "./AudioCore"
import Helper from "./Helper"
import * as filterMapper from "../plugin/graph/index"
import graphPool from "./pool.graph"
import BufferYard from "./BufferYard"
import DEFAULTS from "./defaults"

const context = AudioCore.context


class Part {

    constructor(props,handler = {}){
        this.sound = props.sound
        this.handler = handler
        this.id = props.id || Helper.getUUID()
        this.tags = Array.isArray(props.tags) ? props.tags : []
        this.bpm = props.bpm
        this.measure = props.measure
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
            @age
            - get added 1 when all beats are observed
        */
        this._age = 0

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

        this.active = false
        this.mute = !!props.mute

        this._putTimerRight()

        this.collect = this.collect.bind(this)
    }

    add(newFilter){
        if(!newFilter || !newFilter.priority || newFilter.priority === -1) return false
        /*
            generate a function which receives & returns Graph object.
            like this
            ===================

            graph => {
                return graph
                    .note({ ... })
                    .arrpegio({ ... })
                }
            */
        this.filters = this.filters || []
        this.filters.push(newFilter)
        this.filters.sort((a,b)=>{
            if(a.priority > b.priority) return 1
            else if(a.priority < b.priority) return -1
            else return 0
        })
        this._generator = graph => {
            let hasNote = false
            let mapped = []
            this.filters.forEach((_filter)=>{
                if(
                    !Object.hasOwnProperty.call(filterMapper, _filter.type) ||
                    ( _filter.type !== "note" && !hasNote )
                ){ return false }
                const mappedFunction = filterMapper[_filter.type](_filter.params, graph )
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
            collect soundtrees for notepoints which come in certain range
            */
        while (this.active && this._nextBeatTime < secondToPrefetch){
            if(this._consumedBeats >= this._beatQuota) break

            let element = !this.mute && this._capture()
            if(element){
                collected = collected || []
                collected = collected.concat(element)
            }

            this._nextBeatTime += this._secondsPerBeat

            if(this._currentBeatIndex + 1 >= this.measure * this._beatsInMeasure){
                this._currentBeatIndex = 0
                this._age++
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

    async loadSound(){
        this._isLoading = true
        return new Promise( async (resolve,reject)=>{
            try {
                await BufferYard.import(this.sound)
                this._isLoading = false
                this.active = true
                resolve()
            } catch(e) {
                this._isLoading = false
                this._loadingFailed = true
                reject(e)
            }
        })
    }

    /*
        @tag
        tags: A,B,C...
        タグ A,B,C... を追加
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

    set mute(v) {
        if (typeof v === "boolean") this._mute = v
    }
    get mute() { return this._mute }

    set bpm(v) {
        let bpm = Helper.toInt(v, { max: DEFAULTS.MAX_BPM, min: DEFAULTS.MIN_BPM })
        if (bpm) this._bpm = bpm
    }
    get bpm() { return this._bpm }

    _reset(){
        this._age = 0
        this._currentBeatIndex = 0
        this._consumedBeats = 0
        this._beatQuota = 0
    }

    _putTimerRight(_nextZeroTime){
        this._nextBeatTime = _nextZeroTime || context.currentTime
    }

    _setQuota(totalCap){
        this._beatQuota = totalCap * this._beatsInMeasure
        this.active = true
    }

    /*
        @capture
        - get soundTrees for referring notepoint
    */
    _capture(){
        if(!this._generator) return false
        return this._generator(
            graphPool.allocate({
                sound: this.sound,
                measure: Math.floor(this._currentBeatIndex / this._beatsInMeasure ),
                beatIndex: this._currentBeatIndex % this._beatsInMeasure,
                beatTime: this._nextBeatTime,
                secondsPerBeat: this._secondsPerBeat,
                age: this._age,
                attachment: this._attachment
            })
        )
    }

    get _secondsPerBeat(){ return 60 / this._bpm / 8 }

}

export default Part
