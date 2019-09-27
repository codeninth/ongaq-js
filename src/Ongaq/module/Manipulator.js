import AudioCore from "./AudioCore"
import Part from "./Part"
import DEFAULTS from "./defaults"

const context = AudioCore.context

const Module = (()=>{

    class Manipulator {

        constructor(){
            this.parts = new Map()
            this.previousVolume = DEFAULTS.VOLUME
            this.volume = DEFAULTS.VOLUME
            this.isPlaying = false
            this.nextZeroTime = 0
            this.routine = this.routine.bind(this)
            this.pauseScheduling = this.pauseScheduling.bind(this)
            if (AudioCore.powerMode === "low"){
                window.addEventListener("blur", () => { this.pauseScheduling() })
            }
            
        }

        /*
            @add
            */
        // add(part){

        //     part.bpm = part.bpm || DEFAULTS.BPM
        //     part.notesInMeasure = part.notesInMeasure || DEFAULTS.NOTES_IN_MEASURE
        //     part.measure = part.measure || DEFAULTS.MEASURE

        //     return new Promise((resolve,reject)=>{
        //         const p = new Part(part,{
        //             onLoad: ()=>{
        //                 this.parts.set(p.id, p)
        //                 resolve(p)
        //             },
        //             onError: err=>{
        //                 reject(err)
        //             }
        //         })
        //     })
        // }

        /*
      @prepareCommonGain
      - すべてのaudioNodeが経由するGainNodeを作成
      - playのタイミングで毎回作り直す
    */
        // prepareCommonGain(){
        //     if(this.commonGain) return false
        //     if(!this.commonComp){
        //         this.commonComp = context.createDynamicsCompressor()
        //         this.commonComp.connect(context.destination)
        //     }
        //     this.commonGain = context.createGain()
        //     this.commonGain.connect(this.commonComp)
        //     this.commonGain.gain.setValueAtTime(this.previousVolume || this.volume,0)
        // }

        /*
      @removeCommonGain
    */
        // removeCommonGain(){
        //     if(!this.commonGain) return false
        //     this.commonGain.gain.setValueAtTime(0,0)
        //     this.commonGain = null
        // }

        /*
      @connect
      - SoundTreeをcommonGainに出力する
    */
        // connect(tree){
        //     if(!tree || !this.isPlaying) return false
        //     tree.connect(this.commonGain).start()
        //     tree = null
        //     return true
        // }

        /*
      @setVolume
    */
        // setVolume(v,time){
        //     if(typeof v !== "number" || v < 0 || v > 100) return false
        //     if(v > 0) this.previousVolume = this.volume
        //     this.volume = v / 100
        //     this.commonGain && this.commonGain.gain.setValueAtTime(this.volume,time !== undefined ? time : context.currentTime + 0.01)
        //     return false
        // }

        /*
      @setBpm
    */
        // setBpm(v){
        //     if(typeof v !== "number" || v < 60 || v > 180) return false
        //     this.parts.forEach(p=>{ p.bpm = v })
        //     return false
        // }

        /*
            @startScheduling
            - 一定の間隔でobserveを実行していく
            */
        // startScheduling(){
        //     if(this.isPlaying || this.parts.size === 0) return false
        //     this.isPlaying = true

        //     this.prepareCommonGain()
        //     this.parts.forEach(p=>{
        //         p.putTimerRight(context.currentTime)
        //     })

        //     let list = []
        //     let limitAge = null // TODO
        //     /*
        //       set noteQuota of every part following to the longest part of this loop.
        //     */
        //     this.parts.forEach(p => list.push(p.measure))
        //     let cap = limitAge ? Math.max(...list) * limitAge : Infinity
        //     this.parts.forEach(p => { p.setQuota(cap) })

        //     // this.loop.get(this.activeLoop).putTimerRight()
        //     this.scheduler = window.setInterval( this.routine, AudioCore.powerMode === "middle" ? 50 : 200 )
        // }

        /*
            @pauseScheduling
            */
        // pauseScheduling(){
        //     if(!this.isPlaying) return false
        //     if(this.scheduler){
        //         window.clearInterval(this.scheduler)
        //         this.scheduler = null
        //     }
        //     this.isPlaying = false
        //     this.removeCommonGain()
        // }

        /*
            @routine
            - 各loopに対してobserveを行う
            - 次のageの開始時間（=nextZeroTime）が返ってきたら保持する
            */
        // routine(){
        //     let collected = []
        //     let _soundTree
        //     this.parts.forEach(p=>{
        //         _soundTree = p.observe()
        //         if(_soundTree) _soundTree = _soundTree.filter(i=>i)
        //         if(_soundTree.length > 0) collected = collected.concat( _soundTree )
        //     })
        //     if(collected.length > 0){
        //         collected.forEach(i=>{
        //             if(i.layer && i.layer.length > 0) this.connect(i)
        //         })
        //     }
        //     // TODO
        //     // this.nextZeroTime = plan.nextZeroTime || this.nextZeroTime
        // }


        /*
            @switch
            - 現在のactiveLoopをreset
                -> quotaを再設定、ageを0に
            - 新しいidでactiveLoopを設定
            - nextZeroTimeを次のloopの1拍目にする
            */
        // switch({ id, limitAge }){

        //     /*
        //         idが変わらない場合処理は必要ない
        //     */
        //     return true
        //     // if(id === this.activeLoop) return true

        //     if(this.activeLoop){
        //         let activeLoop = this.loop.get(this.activeLoop)
        //         activeLoop.reset()
        //     }

        //     this.activeLoop = id

        //     window.setTimeout(()=>{
        //         // ノイズを防ぐためタイムラグを設ける
        //         this.loop.get(id).standBy({
        //             nextZeroTime: this.nextZeroTime,
        //             limitAge
        //         })
        //     },5)

        //     return true

        // }

        /*
            @find
            次のような形でLoop, Partオブジェクトを取得する

            {
                resource: "part",
                data: {
                id: "guitar_part"
                }
            }
            */
        // find({ resource, data }){

        //     const keys = ["id","tag"]
        //     let result = void 0

        //     const method = (o,d)=>{
        //         /*
        //         条件指定がないか、条件とマッチする場合に返却
        //       */
        //         if(!d){
        //             result = result || []
        //             result.push(o)
        //         } else {
        //             for(let q in d){
        //                 if(!keys.includes(q)) continue
        //                 else if(
        //                     ( q === "tag" && o[q].includes(d[q]) ) ||
        //                     ( q !== "tag" && o[q] === d[q] )
        //                 ){
        //                     result = result || []
        //                     result.push(o)
        //                 }
        //             }
        //         }
        //     }

        //     switch(resource){

        //     case "loop":
        //         if(this.loop instanceof Map === false) return false
        //         this.loop.forEach(l=>method(l,data))
        //         break

        //     case "part":
        //         if(this.loop instanceof Map === false) return false
        //         this.loop.forEach(l=>{
        //             if(l.part instanceof Map === false) return false
        //             l.part.forEach(p=>method(p,data))
        //         })
        //         break

        //     default:
        //         break
        //     }

        //     return result

        // }

    }

    return Manipulator

}).call(undefined,window || {})

export default new Module()
