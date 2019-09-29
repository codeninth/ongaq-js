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
        this.tag = Array.isArray(props.tag) ? props.tag : []
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

        this.putTimerRight()

        this.observe = this.observe.bind(this)
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

    loadSound(){
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
                    reject()
                })
        })
    }

    reset(){
        this._age = 0
        this._currentBeatIndex = 0
        this._consumedBeats = 0
        this._beatQuota = 0
    }

    putTimerRight(_nextZeroTime){
        this._nextBeatTime = _nextZeroTime || context.currentTime
    }

    setQuota(totalCap){
        this._beatQuota = totalCap * this._beatsInMeasure
        this.active = true
    }

    observe(attachment){

        let observed = []

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

            attachment = typeof attachment === "object" ? Object.assign(attachment,this.attachment) : this.attachment
            let thisMomentObserved = !this.mute && this.capture(attachment)
            if(thisMomentObserved && thisMomentObserved.layer.length > 0) observed = observed.concat(thisMomentObserved)

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
    capture(attachment){

        if(!this._generator) return false
        this._currentGraph = this._generator(
            graphPool.allocate({
                sound: this.sound,
                measure: Math.floor( this._currentBeatIndex / this._beatsInMeasure ),
                beatIndex: this._currentBeatIndex % this._beatsInMeasure,
                beatTime: this._nextBeatTime,
                _secondsPerBeat: this._secondsPerBeat,
                age: this._age,
                attachment: attachment
            })
        )

        this._currentSoundTree = soundTreePool.allocate( this._currentGraph )

        if (this._currentSoundTree.layer.length > 0) return this._currentSoundTree
        else return false

    }

    /*
        @attach
    */
    attach(data = {}){
        this.attachment = Object.assign(this.attachment,data)
    }

    /*
        @detach
    */
    detach(field){
        if (typeof field === "string"){
            delete this.attachment[field]
        } else {
            this.attachment = {}
        }
    }

    /*
        @tag
        tags: A,B,C...
        タグ A,B,C... を追加
        */
    tag(...tags) {
        this.tag = Array.isArray(this.tag) ? this.tag : []
        tags.forEach(tag => {
            if (!this.tag.includes(tag)) this.tag.push(tag)
        })
        return false
    }

    set mute(v){
        if(typeof v === "boolean") this._mute = v
    }
    get mute(){ return this._mute }

    set bpm(v){
        let bpm = Helper.toInt(v, { max: DEFAULTS.MAX_BPM, min: DEFAULTS.MIN_BPM })
        if(bpm) this._bpm = bpm
    }
    get bpm(){ return this._bpm }

    get _secondsPerBeat(){ return 60 / this._bpm / 8 }

}
window.Part = window.Part || Part
export default Part
