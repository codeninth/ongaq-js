import AudioCore from "./module/AudioCore"
import BufferYard from "./module/BufferYard"
import Helper from "./module/Helper"
import DEFAULTS from "./module/defaults"
import DRUM_NOTE from "../Constants/DRUM_NOTE"
import ROOT from "../Constants/ROOT"
import SCHEME from "../Constants/SCHEME"
import VERSION from "../Constants/VERSION"

const context = AudioCore.context

class Ongaq {

    constructor(o){
        this.init(o)
    }

    /*
      @init
    */
    init({ api_key, volume, bpm, onReady }){
      this.parts = new Map()
      this.isPlaying = false
      this.routine = this.routine.bind(this)
      this.volume = volume || DEFAULTS.VOLUME
      this.previousVolume = this.volume
      this.bpm = bpm || DEFAULTS.BPM
      this.onReady = typeof onReady === "function" && onReady 
      if (AudioCore.powerMode === "low") {
        window.addEventListener("blur", () => { this.pauseScheduling() }) 
      }
      this._nextZeroTime = 0
      BufferYard.set({ api_key })
    }

    /*
      @add
      - jsonからtune/partオブジェクトを作成する
    */
    add(part){
        return new Promise((resolve,reject)=>{
          part.bpm = part.bpm || this.bpm
          part._beatsInMeasure = part._beatsInMeasure || DEFAULTS.NOTES_IN_MEASURE
          part.measure = part.measure || DEFAULTS.MEASURE
          this.parts.set(part.id, part)
          
          if(typeof part.loadSound !== "function") return reject()
          part.loadSound().then(()=>{
            let isAllPartsLoaded = true
              /*
                when all parts got loaded own sound,
                fire this.onReady
              */
              this.parts.forEach(p=>{
                if (p._isLoading || p._loadingFailed) isAllPartsLoaded = false
              })
              if (isAllPartsLoaded) this.onReady && this.onReady()
          }).catch(reject)

        })
    }

    /*
      @prepareCommonGain
      - すべてのaudioNodeが経由するGainNodeを作成
      - playのタイミングで毎回作り直す
    */
    prepareCommonGain() {
      if (this.commonGain) return false
      if (!this.commonComp) {
        this.commonComp = context.createDynamicsCompressor()
        this.commonComp.connect(context.destination)
      }
      this.commonGain = context.createGain()
      this.commonGain.connect(this.commonComp)
      this.commonGain.gain.setValueAtTime(this.previousVolume || this.volume, 0)
    }

    /*
      @removeCommonGain
    */
    removeCommonGain() {
      if (!this.commonGain) return false
      this.commonGain.gain.setValueAtTime(0, 0)
      this.commonGain = null
    }

    /*
      @connect
      - SoundTreeをcommonGainに出力する
    */
    connect(tree) {
      if (!tree || !this.isPlaying) return false
      tree.connect(this.commonGain).start()
      tree = null
      return true
    }

    /*
      @start
      - 一定の間隔でobserveを実行していく
      */
    start() {
      if (this.isPlaying || this.parts.size === 0) return false
      this.isPlaying = true

      this.prepareCommonGain()
      this.parts.forEach(p => {
        p.putTimerRight(context.currentTime)
      })

      let list = []
      let limitAge = null // TODO
      /*
        set _beatQuota of every part following to the longest part
      */
      this.parts.forEach(p => list.push(p.measure))
      let cap = limitAge ? Math.max(...list) * limitAge : Infinity
      this.parts.forEach(p => { p.setQuota(cap) })

      this.scheduler = window.setInterval(this.routine, AudioCore.powerMode === "middle" ? 50 : 200)
    }

    /*
      @pause
      */
    pause() {
      if (!this.isPlaying) return false
      if (this.scheduler) {
        window.clearInterval(this.scheduler)
        this.scheduler = null
      }
      this.isPlaying = false
      this.removeCommonGain()
    }

    /*
      @routine
      - 各loopに対してobserveを行う
      - 次のageの開始時間（=_nextZeroTime）が返ってきたら保持する
      */
    routine() {
      let collected = []
      let _soundTree
      this.parts.forEach(p => {
        _soundTree = p.observe()
        if (_soundTree) _soundTree = _soundTree.filter(i => i)
        if (_soundTree.length > 0) collected = collected.concat(_soundTree)
      })
      if (collected.length > 0) {
        collected.forEach(i => {
          if (i.layer && i.layer.length > 0) this.connect(i)
        })
      }
      // TODO
      // this._nextZeroTime = plan._nextZeroTime || this._nextZeroTime
    }

    /*
    @find
    次のような形でLoop, Partオブジェクトを取得する

    {
      resource: "part",
      data: {
        name: "guitar_part"
      }
    }
  */
  find({ data }) {

    const keys = ["id", "tag"]
    let result = void 0

    const method = (o, d) => {
      /*
      条件指定がないか、条件とマッチする場合に返却
    */
      if (!d) {
        result = result || []
        result.push(o)
      } else {
        for (let q in d) {
          if (!keys.includes(q)) continue
          else if (
            (q === "tag" && o[q].includes(d[q])) ||
            (q !== "tag" && o[q] === d[q])
          ) {
            result = result || []
            result.push(o)
          }
        }
      }
    }

    this.parts.forEach(p => method(p, data))

    return result

  }

    /*
      @get params
    */
    get params(){
      let loading = false
      this.parts.forEach(p=>{ if(p._isLoading) loading = true })
      return {
        loading: loading,
        isPlaying: this.isPlaying,
        originTime: AudioCore.originTime,
        currentTime: context.currentTime,
        volume: this.volume
      }
    }

    get constants(){
      return {
        DRUM_NOTE,
        ROOT,
        SCHEME
      }
    }

    get version(){ return VERSION }

    set volume(v){
      if (typeof v !== "number" || v < 0 || v > 100) return false
      if (v > 0) this.previousVolume = this._volume
      this._volume = v / 100
      this.commonGain && this.commonGain.gain.setValueAtTime(this._volume, time !== undefined ? time : context.currentTime + 0.01)
    }

    get volume(){
      return this._volume * 100
    }

    set bpm(v){
      let bpm = Helper.toInt(v, { max: DEFAULTS.MAX_BPM, min: DEFAULTS.MIN_BPM })
      if (!bpm) return false
      this._bpm = bpm
      this.parts.forEach(p => { p.bpm = bpm })
    }

    get bpm(){
      return this._bpm 
    }

}

window.Ongaq = window.Ongaq || Ongaq

export default Ongaq
