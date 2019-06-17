import AudioCore from "./AudioCore"
import Helper from "./Helper"
import * as plugin from "../plugin/graph/index"
import soundTreePool from "./pool.soundtree"
import graphPool from "./pool.graph"

const CONSTANTS = {
    BPM_MIN: 60,
    BPM_MAX: 180
}

const DEFAULT = {
    MEASURE: 1,
    NOTE_IN_MEASURE: 16,
    PREFETCH_SECOND: 0.3
}

const context = AudioCore.getContext()

const Module = (()=>{

    class PartItem {

        constructor(props){
            this.sound = props.sound
            this.id = props.id || Helper.getUUID()
            this.tag = Array.isArray(props.tag) ? props.tag : []
            this.bpm = props.bpm
            this.measure = props.measure || DEFAULT.MEASURE
            this.notesInMeasure = props.notesInMeasure || DEFAULT.NOTE_IN_MEASURE
            this.currentNoteIndex = 0

            /*

            以下のような graphオブジェクトを引数にとり
            graphオブジェクトを返す関数を作成する。
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
                },graph)
            }
            this.generator = this.generator.bind(this)

            /*
        @nextNoteTime 次の拍に対応するcurrentTime
      */
            this.nextNoteTime = 0

            /*
        @age すべての拍がobserveされると1加算される値
      */
            this.age = 0

            /*
        @age 何拍分observeされるまでactiveであるかを表す、あらかじめ割り当てられた値
      */
            this.noteQuota = 0

            /*
        @consumedNotes 現在までに何拍分がobserveされたか
      */
            this.consumedNotes = 0

            /*
        @attachment graph経由generatorに渡され、ユーザの意向をgeneratorに反映させるためのデータ
      */
            this.attachment = {}

            this.active = true
            this.mute = !!props.mute

            this.putTimerRight()

            this.observe = this.observe.bind(this)

        }

        pause(){
            this.active = false
        }

        reset(){
            this.age = 0
            this.currentNoteIndex = 0
            this.consumedNotes = 0
            this.noteQuota = 0
        }

        putTimerRight(nextZeroTime){
            this.nextNoteTime = nextZeroTime || context.currentTime
        }

        setQuota(loopQuota){
            this.noteQuota = loopQuota * this.notesInMeasure
            this.active = true
        }

        observe(attachment){

            /*
        - 現在から一定範囲に再生開始時刻を迎えるnoteIndexに対応するSoundTreeを取得する。
      */
            let observed = []
            while(this.active && this.nextNoteTime < context.currentTime + DEFAULT.PREFETCH_SECOND){

                if(this.consumedNotes >= this.noteQuota) break

                attachment = typeof attachment === "object" ? Object.assign(attachment,this.attachment) : this.attachment
                let thisMomentObserved = !this.mute && this.capture(attachment)
                if(thisMomentObserved && thisMomentObserved.layer.length > 0) observed = observed.concat(thisMomentObserved)

                this.nextNoteTime += this.secondsPerNote

                if(this.currentNoteIndex + 1 >= this.measure * this.notesInMeasure){
                    this.currentNoteIndex = 0
                    this.age++
                } else {
                    this.currentNoteIndex++
                }

                if(++this.consumedNotes >= this.noteQuota){
                    this.active = false
                    break
                }

            }

            return observed

        }

        /*
      get soundTree
    */
        play(){

            if(!this.player) return false
            this.playingGraph = this.player(
                graphPool.allocate({
                    sound: this.sound,
                    attachment: this.attachment
                })
            )
            this.playingSoundTree = soundTreePool.allocate( this.playingGraph )
            return false

        }

        /*
      get soundTrees for directed noteIndex
    */
        capture(attachment){

            if(!this.generator) return false
            this.currentGraph = this.generator(
                graphPool.allocate({
                    sound: this.sound,
                    noteIndex: this.currentNoteIndex,
                    noteTime: this.nextNoteTime,
                    secondsPerNote: this.secondsPerNote,
                    age: this.age,
                    attachment: attachment
                })
            )

            this.currentSoundTree = soundTreePool.allocate( this.currentGraph )

            if(this.currentSoundTree.layer.length > 0) return this.currentSoundTree
            return false

        }

        /*
      @attach
      - generatorに渡す値を更新する
    */
        attach(data = {}){
            this.attachment = Object.assign(this.attachment,data)
        }

        /*
      @detach
      - generatorに渡す値をリセットする
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
            let bpm = Helper.toInt(v,{ max: CONSTANTS.BPM_MAX, min: CONSTANTS.BPM_MIN })
            if(bpm) this._bpm = bpm
        }
        get bpm(){ return this._bpm }

        set chapter(raw){
            if(!Array.isArray(raw)) return false
            this._chapter = raw
        }
        get chapter(){ return this._chapter }

        get secondsPerNote(){ return 60 / this.bpm / 8}

        get absNoteIndex(){ return this.currentNoteIndex + this.age * this.measure * this.notesInMeasure }

    }

    return PartItem

}).call(undefined,window)

export default Module
