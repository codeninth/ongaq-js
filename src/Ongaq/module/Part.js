import AudioCore from "./AudioCore"
import Helper from "./Helper"
import * as plugin from "../plugin/graph/index"
import soundTreePool from "./pool.soundtree"
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
        this.attachment = {}

        this.active = false
        this.mute = !!props.mute

        this._putTimerRight()

        this._observe = this._observe.bind(this)
    }

    add(newFilter){
        if(!newFilter) return false
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
        this._generator = graph => {
            return this.filters.reduce((prevGraph, nextFilter) => {
                if (Object.hasOwnProperty.call(plugin, nextFilter.type)) {
                    return prevGraph[nextFilter.type](nextFilter.params)
                } else {
                    return prevGraph
                }
            }, graph)
        }
        this._generator = this._generator.bind(this)
    }

    /*
        @attach
    */
    attach(data = {}) {
        this._attachment = Object.assign(this._attachment, data)
    }

    /*
        @detach
    */
    detach(field) {
        if (typeof field === "string") delete this._attachment[field]
        else this._attachment = {}
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

    set mute(v) {
        if (typeof v === "boolean") this._mute = v
    }
    get mute() { return this._mute }

    set bpm(v) {
        let bpm = Helper.toInt(v, { max: DEFAULTS.MAX_BPM, min: DEFAULTS.MIN_BPM })
        if (bpm) this._bpm = bpm
    }
    get bpm() { return this._bpm }

    _loadSound(){
        this._isLoading = true
        return new Promise((resolve,reject)=>{
            BufferYard.import(this.sound)
                .then(() => {
                    this._isLoading = false
                    this.active = true
                    resolve()
                })
                .catch(err => {
                    this._isLoading = false
                    this._loadingFailed = true
                    reject(err)
                })
        })
    }

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

    _observe(){

        let observed

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

            let thisMomentObserved = !this.mute && this._capture()
            if(thisMomentObserved && thisMomentObserved.layer.length > 0){
                observed = observed || []
                observed = observed.concat(thisMomentObserved)
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
        return observed

    }

    /*
        @capture
        - get soundTrees for referring notepoint
    */
    _capture(){

        if(!this._generator) return false
        this._currentGraph = this._generator(
            graphPool.allocate({
                sound: this.sound,
                measure: Math.floor( this._currentBeatIndex / this._beatsInMeasure ),
                beatIndex: this._currentBeatIndex % this._beatsInMeasure,
                beatTime: this._nextBeatTime,
                _secondsPerBeat: this._secondsPerBeat,
                age: this._age,
                attachment: this._attachment
            })
        )

        this._currentSoundTree = soundTreePool.allocate( this._currentGraph )

        if (this._currentSoundTree.layer.length > 0) return this._currentSoundTree
        else return false

    }

    get _secondsPerBeat(){ return 60 / this._bpm / 8 }

}

export default Part
