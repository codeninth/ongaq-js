import AudioCore from "./AudioCore"
import Helper from "./Helper"
import * as plugin from "../plugin/graph/index"
import soundTreePool from "./pool.soundtree"
import graphPool from "./pool.graph"
import BufferYard from "./BufferYard"
import DEFAULTS from "./defaults"

const context = AudioCore.context

const Module = (()=>{

    class Part {

        constructor(props,handler){
            this.sound = props.sound
            this.id = props.id || Helper.getUUID()
            this.tag = Array.isArray(props.tag) ? props.tag : []
            this.bpm = props.bpm
            this.measure = props.measure
            this._beatsInMeasure = props._beatsInMeasure
            this._currentBeatIndex = 0

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
            this.filters = props.filters
            this.generator = graph => {
                return props.filters.reduce(( prevGraph, newFilter ) => {
                    if (Object.hasOwnProperty.call( plugin, newFilter.type ) ){
                        return prevGraph[ newFilter.type ]( newFilter.params )
                    } else {
                        return prevGraph
                    }
                }, graph )
            }
            this.generator = this.generator.bind(this)

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
            this.age = 0

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
            BufferYard.import([this.sound])
                .then(() => {
                    console.log(this)
                    this.active = true
                    handler.onLoad && handler.onLoad()
                })
                .catch((err) => { handler.onError && handler.onError(err) })
        }

        reset(){
            this.age = 0
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

                this._nextBeatTime += this.secondsPerNote

                if(this._currentBeatIndex + 1 >= this.measure * this._beatsInMeasure){
                    this._currentBeatIndex = 0
                    this.age++
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

            if(!this.generator) return false
            this.currentGraph = this.generator(
                graphPool.allocate({
                    sound: this.sound,
                    measure: Math.floor( this._currentBeatIndex / this._beatsInMeasure ),
                    noteIndex: this._currentBeatIndex % this._beatsInMeasure,
                    noteTime: this._nextBeatTime,
                    secondsPerNote: this.secondsPerNote,
                    age: this.age,
                    attachment: attachment
                })
            )

            this.currentSoundTree = soundTreePool.allocate( this.currentGraph )

            if(this.currentSoundTree.layer.length > 0){
                return this.currentSoundTree
            } return false

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

        get secondsPerNote(){ return 60 / this._bpm / 8 }

    }

    return Part

}).call(undefined,window || {})

export default Module
