import Part from "./Part"
import BufferYard from "./BufferYard"
import Helper from "./Helper"

const CONSTANTS = {
    BPM_MIN: 60,
    BPM_MAX: 180,
    DEFAULT: {
        BPM: 100
    }
}

const Module = (()=>{

    class Loop {

        constructor(props,o = {}){

            this.id = props.id || Helper.getUUID()
            this.bpm = props.bpm || CONSTANTS.DEFAULT.BPM
            this.tag = Array.isArray(props.tag) ? props.tag : []

            this.part = ((raw)=>{
                if(!raw) return undefined
                let partInstances = raw.map(p=>{
                    p.bpm = p.bpm || this.bpm
                    return new Part(p)
                })
                let part = new Map()
                partInstances.forEach(pi=>part.set(pi.id,pi))
                return part
            })(props.part)

            /*
              "age" is how many time this loop looped.
              It counts up when the part which has the longest measure aged.
            */
            this.age = 0
            this.limitAge = props.limitAge

            this.attachment = {}

            /*
              keep observation while loop is active
            */
            this.active = false

            this.onLoad = typeof o.onLoad === "function" ? o.onLoad : null
            this.onError = typeof o.onError === "function" ? o.onError : null
            this.willAge = typeof o.willAge === "function" ? o.willAge : null

            this.setQuota(this.limitAge)

            /*
              List up the sound names from all parts.
              When all sound resources are loaded, call onLoad.
              全ての音源がダウンロードされた場合、onLoadハンドラを呼び出す。
            */
            let sounds = []
            this.part.forEach(p=>{ sounds.push( p.sound ) })
            sounds = sounds.filter( (sound,index,self) => self.indexOf(sound) === index )

            BufferYard.import(sounds)
                .then(()=>{
                    this.active = true
                    this.onLoad && this.onLoad()
                })
                .catch((err)=>{ this.onError && this.onError(err) })

        }

        set bpm(v){
            v = Helper.toInt(v,{ max: CONSTANTS.BPM_MAX, min: CONSTANTS.BPM_MIN })
            if(!v) return false
            this._bpm = v
            this.part && this.part.forEach(p=>{ p.bpm = v })
        }
        get bpm(){ return this._bpm }

        /*
        @setQuota
          "cap" represents how many measures to go
          before the longest part loops for "limitAge" times.
        */
        setQuota(limitAge){
            let list = []
            if(!this.part.size) return 0
            if(limitAge) this.limitAge = limitAge

            /*
              set noteQuota of every part following to the longest part of this loop.
            */
            this.part.forEach(p=> list.push(p.measure) )
            let cap = limitAge ? Math.max(...list) * limitAge : Infinity
            this.part.forEach(p=>{ p.setQuota(cap) })
            return false
        }

        /*
          @standBy

          - reset quota
          - method for the next loop to play
        */
        standBy(o = {}){
            if(o.nextZeroTime > 0) this.putTimerRight(o.nextZeroTime)
            if(o.limitAge > 0) this.setQuota(o.limitAge)
            return false
        }

        /*
          @reset
          - method for played loop to stop
        */
        reset(){
            this.age = 0
            this.part.forEach(p=>p.reset())
        }

        /*
          @putTimerRight
          - 次の0拍目にあたるcurrentTime(=nextZeroTime) が指定されていたら
            所属するpartに伝播する。switchを行った際に必要となる
          - 指定がなければ、 context.currentTimeを使う
        */
        putTimerRight(nextZeroTime){
            this.part.forEach(p=>p.putTimerRight(nextZeroTime))
        }

        /*
          @attach
          - generatorに渡す値を更新する
        */
        attach(data){
            this.part.forEach(p=>p.attach(data))
        }

        /*
          @detach
          - generatorに渡す値をリセットする
        */
        detach(o){
            this.part.forEach(p=>p.detach(o))
        }

        /*
          @observe
          - collect soundTrees
        */
        observe(){

            if(!this.active) return false
            let nextZeroTime
            let aged = false

            /*
              - collect the ages of all parts
              - if elder than loop's age, update loop's age
            */
            let currentAge = (()=>{

                let age = []

                if(!this.part || !this.part.size) return 0
                this.part.forEach(p=>{
                    age.push(p.age)
                })

                // reduce to minimum age
                age = age.reduce( (x,y)=> x<=y?x:y, age[0] )
                return age

            })()

            /*
              if ages of all parts are beyond this loop's age,
              call handler and propagate updated ZeroTime
            */
            if(currentAge > this.age){

                aged = true
                this.age = currentAge

                let pickedUpPart = null
                this.part.forEach((p)=>{
                    if(!pickedUpPart && p.age === currentAge) pickedUpPart = p
                })
                nextZeroTime = pickedUpPart.nextNoteTime - pickedUpPart.secondsPerNote * pickedUpPart.currentNoteIndex

                this.willAge && this.willAge({
                    age: this.age,
                    nextZeroTime: nextZeroTime
                })

            }

            let soundTree = (()=>{

                let soundTree
                this.part.forEach(p=>{
                    let observed = p.observe(this.attachment)
                    if(observed.length === 0) return soundTree
                    soundTree = soundTree || []
                    observed.forEach(o=>{ soundTree.push(o) })
                })
                return soundTree

            })()

            return {
                soundTree: soundTree,
                nextZeroTime: aged ? nextZeroTime : undefined
            }

        }

        /*
          @tag
          tags: A,B,C...
          タグ A,B,C... を追加
        */
        tag(...tags){
            this.tag = Array.isArray(this.tag) ? this.tag : []
            tags.forEach(tag=>{
                if(!this.tag.includes(tag)) this.tag.push(tag)
            })
            return false
        }

    }

    return Loop

}).call(undefined,window || {})

export default Module