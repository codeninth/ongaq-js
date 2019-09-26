import AudioCore from "./AudioCore"
import Loop from "./Loop"
import Part from "./Part"
import DEFAULT from "./default"

const context = AudioCore.context

const Module = (()=>{

    class Manipulator {

        constructor(){
            this.loop = new Map()
            this.loop.set("activeLoop",new Map())
            this.activeLoop = "activeLoop"
            // this.activeLoop = ""
            this.previousVolume = DEFAULT.VOLUME
            this.volume = DEFAULT.VOLUME
            this.isPlaying = false
            this.nextZeroTime = 0
            this.routine = this.routine.bind(this)
            this.pauseScheduling = this.pauseScheduling.bind(this)
            if (AudioCore.powerMode === "low"){
                window.addEventListener("blur", () => { this.pauseScheduling() })
            }

        }

        set activeLoop(id){
            if(typeof id !== "string") return false
            this._activeLoop = id
        }

        get activeLoop(){ return this._activeLoop }

        /*
          @createPart
        */
        createPart( _public = {}, option = {} ){

          const _private = new Part( _public, option )
          console.log(_private)
          console.log(" ******* ")
          const handler = {
            set: (obj,prop,value)=>{
              _private[prop] = value
            },
            get: (target,prop)=>{
              console.log(prop)
              console.log(_private[prop])
              return _private[prop]
            }
          }

          this.loop.get("activeLoop").set( _private.id, _private )
          console.log(this.loop)
          return new Proxy( _public, handler )

        }

        /*
          @loadLoop
        */
        loadLoop(loop){

            loop.bpm = loop.bpm || DEFAULT_BPM

            return new Promise((resolve,reject)=>{

              const _resolve = (_private)=>{
                console.log(_private)
                const proxy = new Proxy(loop, handler)
                this.activeLoop = this.activeLoop || _private.id
                this.loop.set( _private.id, proxy )
                console.log(proxy)
                resolve(proxy)
              }
              const handler = (()=>{
                  const _private = new Loop(loop,{
                      onLoad: ()=>{ _resolve(_private) },
                      onError: err=>{ reject(err) }
                  })
                  const publicKeys = Object.keys(loop)
                  return {
                      get: (_public, prop)=>{
                        // console.log(typeof _private[prop] === "function", prop.indexOf("_") === 0)
                        return _private[prop]
                      },
                      set: (_public, prop, value)=>{
                        // if( prop.indexOf("_") === 0 ) _private[prop] = value
                        // else _public[prop] = value
                        console.log(prop,value)
                        _private[prop] = value
                      }
                  }
              })()

            })
        }

        /*
      @prepareCommonGain
      - すべてのaudioNodeが経由するGainNodeを作成
      - playのタイミングで毎回作り直す
    */
        prepareCommonGain(){
            if(this.commonGain) return false
            if(!this.commonComp){
                this.commonComp = context.createDynamicsCompressor()
                this.commonComp.connect(context.destination)
            }
            this.commonGain = context.createGain()
            this.commonGain.connect(this.commonComp)
            this.commonGain.gain.setValueAtTime(this.previousVolume || this.volume,0)
        }

        /*
      @removeCommonGain
    */
        removeCommonGain(){
            if(!this.commonGain) return false
            this.commonGain.gain.setValueAtTime(0,0)
            this.commonGain = null
        }

        /*
      @connect
      - SoundTreeをcommonGainに出力する
    */
        connect(tree){
            if(!tree || !this.isPlaying) return false
            tree.connect(this.commonGain).start()
            tree = null
            return true
        }

        /*
      @setVolume
    */
        setVolume(v,time){
            if(typeof v !== "number" || v < 0 || v > 100) return false
            if(v > 0) this.previousVolume = this.volume
            this.volume = v / 100
            this.commonGain && this.commonGain.gain.setValueAtTime(this.volume,time !== undefined ? time : context.currentTime + 0.01)
            return false
        }

        /*
      @setBpm
    */
        setBpm(v){
            if(typeof v !== "number" || v < 60 || v > 180) return false
            this.loop.forEach(t=>{ t.bpm = v })
            return false
        }

        /*
      @startScheduling
      - 一定の間隔でobserveを実行していく
    */
        startScheduling(){
            if(this.isPlaying || this.loop.size === 0) return false
            this.isPlaying = true

            this.prepareCommonGain()
            this.loop.get(this.activeLoop).putTimerRight()
            this.scheduler = window.setInterval( this.routine, AudioCore.powerMode === "middle" ? 50 : 200 )
        }

        /*
      @pauseScheduling
    */
        pauseScheduling(){
            if(!this.isPlaying) return false
            if(this.scheduler){
                window.clearInterval(this.scheduler)
                this.scheduler = null
            }
            this.isPlaying = false
            this.removeCommonGain()
        }

        /*
      @routine
      - 各loopに対してobserveを行う
      - 次のageの開始時間（=nextZeroTime）が返ってきたら保持する
    */
        routine(){
            let plan = this.loop.get(this.activeLoop).observe()
            if(Array.isArray(plan.soundTree)){
                plan.soundTree.forEach(tree=>{
                    if(tree.layer && tree.layer.length > 0) this.connect(tree)
                })
            }
            this.nextZeroTime = plan.nextZeroTime || this.nextZeroTime
        }


        /*
      @switch
      - 現在のactiveLoopをreset
        -> quotaを再設定、ageを0に
      - 新しいidでactiveLoopを設定
      - nextZeroTimeを次のloopの1拍目にする
    */
        switch({ id, limitAge }){

            /*
        idが不正, loopが読み込まれていない場合はreject
      */
            if(
                !id ||
                !(this.loop instanceof Map) ||
                !this.loop.has(id)
            ) return false

            /*
        idが変わらない場合処理は必要ない
      */
            if(id === this.activeLoop) return true

            if(this.activeLoop){
                let activeLoop = this.loop.get(this.activeLoop)
                activeLoop.reset()
            }

            this.activeLoop = id

            window.setTimeout(()=>{
                // ノイズを防ぐためタイムラグを設ける
                this.loop.get(id).standBy({
                    nextZeroTime: this.nextZeroTime,
                    limitAge
                })
            },5)

            return true

        }

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
        find({ resource, data }){

            const keys = ["id","tag"]
            let result = void 0

            const method = (o,d)=>{
                /*
                条件指定がないか、条件とマッチする場合に返却
              */
                if(!d){
                    result = result || []
                    result.push(o)
                } else {
                    for(let q in d){
                        if(!keys.includes(q)) continue
                        else if(
                            ( q === "tag" && o[q].includes(d[q]) ) ||
                            ( q !== "tag" && o[q] === d[q] )
                        ){
                            result = result || []
                            result.push(o)
                        }
                    }
                }
            }

            switch(resource){

            case "loop":
                if(this.loop instanceof Map === false) return false
                this.loop.forEach(l=>method(l,data))
                break

            case "part":
                if(this.loop instanceof Map === false) return false
                this.loop.forEach(l=>{
                    if(l.part instanceof Map === false) return false
                    l.part.forEach(p=>method(p,data))
                })
                break

            default:
                break
            }

            return result

        }

    }

    return Manipulator

}).call(undefined,window || {})

export default new Module()
