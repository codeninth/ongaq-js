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
        this._init(o)
    }

    /*
      @add
    */
    add(part){

        return new Promise((resolve,reject)=>{

            if (typeof part._loadSound !== "function") return reject("not a Part object")

            part.bpm = part.bpm || this.bpm
            part._beatsInMeasure = part._beatsInMeasure || DEFAULTS.NOTES_IN_MEASURE
            part.measure = part.measure || DEFAULTS.MEASURE
            this.parts.set(part.id, part)

            part._loadSound().then(()=>{
                let isAllPartsLoaded = true
                /*
                when all parts got loaded own sound,
                fire this.onReady
              */
                this.parts.forEach(p=>{
                    if (p._isLoading || p._loadingFailed) isAllPartsLoaded = false
                })
                if (isAllPartsLoaded) this.onReady && this.onReady()
                return resolve()
            }).catch(reject)

        })
    }

    /*
      @start
      - 一定の間隔で _observe を実行していく
      */
    start() {
        if (this.isPlaying || this.parts.size === 0) return false
        this.isPlaying = true

        this._prepareCommonGain()
        this.parts.forEach(p => { p._putTimerRight(context.currentTime) })

        let list = []
        let limitAge = null // TODO
        /*
        set _beatQuota of every part following to the longest part
      */
        this.parts.forEach(p => list.push(p.measure))
        let cap = limitAge ? Math.max(...list) * limitAge : Infinity
        this.parts.forEach(p => { p._setQuota(cap) })

        this._scheduler = window.setInterval(this._routine, AudioCore.powerMode === "middle" ? 50 : 200)
        return false
    }

    /*
      @pause
      */
    pause() {
        if (!this.isPlaying) return false
        if (this._scheduler) {
            window.clearInterval(this._scheduler)
            this._scheduler = null
        }
        this.isPlaying = false
        this._removeCommonGain()
        return false
    }

    /*
  @find
  collect part by tags
  */
    find(...tags) {

        let result = void 0
        if (tags.length === 0) return result
        this.parts.forEach(p => {
            if (tags.every(tag => p.tags.include(tag))) {
                result = result || []
                result.push(p)
            }
        })
        return result

    }

    /*
      @get params
    */
    get params() {
        let loading = false
        this.parts.forEach(p => { if (p._isLoading) loading = true })
        return {
            loading: loading,
            isPlaying: this.isPlaying,
            originTime: AudioCore.originTime,
            currentTime: context.currentTime,
            volume: this.volume
        }
    }

    get constants() {
        return {
            DRUM_NOTE,
            ROOT,
            SCHEME
        }
    }

    get version() { return VERSION }

    set volume(v) {
        if (typeof v !== "number" || v < 0 || v > 100) return false
        if (v > 0) this._previousVolume = this._volume
        this._volume = v / 100
        this.commonGain && this.commonGain.gain.setValueAtTime(
            this._volume,
            context.currentTime + 0.01
        )
    }

    get volume() {
        return this._volume * 100
    }

    set bpm(v) {
        let bpm = Helper.toInt(v, { max: DEFAULTS.MAX_BPM, min: DEFAULTS.MIN_BPM })
        if (!bpm) return false
        this._bpm = bpm
        this.parts.forEach(p => { p.bpm = bpm })
    }

    get bpm() {
        return this._bpm
    }

    /*
      @_init
    */

    _init({ api_key, volume, bpm, onReady }){
        this.parts = new Map()
        this.isPlaying = false
        this.volume = volume || DEFAULTS.VOLUME
        this._previousVolume = this.volume
        this._nextZeroTime = 0
        this.bpm = bpm || DEFAULTS.BPM
        if (AudioCore.powerMode === "low") {
            window.addEventListener("blur", () => { this.pauseScheduling() })
        }
        this.onReady = typeof onReady === "function" && onReady
        this._routine = this._routine.bind(this)
        BufferYard.set({ api_key })
    }

    /*
      @_prepareCommonGain
      - すべてのaudioNodeが経由するGainNodeを作成
      - playのタイミングで毎回作り直す
    */
    _prepareCommonGain() {
        if (this.commonGain) return false
        if (!this.commonComp) {
            this.commonComp = context.createDynamicsCompressor()
            this.commonComp.connect(context.destination)
        }
        this.commonGain = context.createGain()
        this.commonGain.connect(this.commonComp)
        this.commonGain.gain.setValueAtTime(this._previousVolume || this.volume, 0)
    }

    /*
      @_removeCommonGain
    */
    _removeCommonGain() {
        if (!this.commonGain) return false
        this.commonGain.gain.setValueAtTime(0, 0)
        this.commonGain = null
        return false
    }

    /*
      @_connect
    */
    _connect(elem) {
        if (!elem || !this.isPlaying) return false
        elem.terminal.forEach(t=>{
            t.connect( this.commonGain )
        })
        elem.initizalize()
    }

    /*
      @_routine
      - 各partに対してobserveを行う
      */
    _routine() {
        let collected
        let elements
        this.parts.forEach(p => {
            elements = p._observe()
            if (elements && elements.length > 0){
                collected = collected || []
                collected = collected.concat(elements)
            }
        })
        if(!collected || collected.length === 0) return false
        collected.forEach(elem => { this._connect(elem) })
        // TODO
        // this._nextZeroTime = plan._nextZeroTime || this._nextZeroTime
    }

}

export default Ongaq
