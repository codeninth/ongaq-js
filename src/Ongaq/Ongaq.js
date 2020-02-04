import AudioCore from "./module/AudioCore"
import BufferYard from "./module/BufferYard"
import Helper from "./module/Helper"
import DEFAULTS from "./module/defaults"
import ElementPool from "./module/pool.element"
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

        return new Promise( async (resolve,reject)=>{

            if (typeof part.loadSound !== "function") return reject("not a Part object")

            part.bpm = part.bpm || this.bpm
            this.parts.set(part.id, part)

            try {
                await part.loadSound()
                let isAllPartsLoaded = true
                /*
                    when all parts got loaded own sound,
                    fire this.onReady
                */
                this.parts.forEach(p => {
                    if (p._isLoading || p._loadingFailed) isAllPartsLoaded = false
                })
                if (isAllPartsLoaded) this.onReady && this.onReady()
                resolve()
            } catch(e){
                if (!this.isError){
                    this.onError && this.onError(e)
                    this.isError = true
                }
                reject(e)
            }

        })
    }

    /*
      @start
      - 一定の間隔で collect を実行していく
      */
    start() {
        if (this.isPlaying || this.parts.size === 0) return false
        this.isPlaying = true

        this._prepareCommonGain()
        this.parts.forEach(p => { p._putTimerRight(context.currentTime) })

        this._scheduler = window.setInterval(this._routine, AudioCore.powerMode === "middle" ? 50 : 200)
        return false
    }

    record(o = {}){
        if (!window.OfflineAudioContext) throw "OfflineAudioContext is not supported"
        if (this.isPlaying || this.parts.size === 0) return false

        // ====== calculate the seconds of beats beforehand
        const seconds = []
        this.parts.forEach(p => {
            const _maxLap = (typeof o.maxLap === "number" && o.maxLap > 0) ? o.maxLap : p.maxLap
            seconds.push(_maxLap * p.measure * p._beatsInMeasure * p._secondsPerBeat)
        })
        const wavSeconds = (()=>{
            if(typeof o.seconds === "number" && o.seconds >= 1 && o.seconds <= 40) return o.seconds
            else if (Math.max(seconds) < 1) return 1
            else if (Math.max(seconds) < 40) return Math.max(seconds)
            else return 40
        })()
        const offlineContext = new OfflineAudioContext(2, 44100 * wavSeconds, 44100)

        // =======
        const commonComp = offlineContext.createDynamicsCompressor()
        commonComp.connect(offlineContext.destination)

        const commonGain = offlineContext.createGain()
        commonGain.connect(commonComp)
        commonGain.gain.setValueAtTime(this._volume, 0)

        this._routine({
            offlineConnect: elem => {
                if (elem.terminal.length > 0) {
                    elem.terminal[elem.terminal.length - 1].forEach(t => {
                        t.connect(commonGain)
                    })
                }
                elem.initialize()
                ElementPool.retrieve(elem)
            },
            offlineContext: offlineContext
        })

        return offlineContext.startRendering()
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

        let result = []
        if (tags.length === 0) return result
        this.parts.forEach(p => {
            if ( tags.every(tag => p.tags.includes(tag)) ) result.push(p)
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
        this._volume = v / 100 * AudioCore.SUPPRESSION
        this.commonGain && this.commonGain.gain.setValueAtTime(
            this._volume,
            context.currentTime + 0.01
        )
    }

    get volume() {
        return this._volume * 100 / AudioCore.SUPPRESSION
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

    _init({ api_key, volume, bpm, onReady, onError }){
        this.parts = new Map()
        this.isPlaying = false
        this.volume = volume || DEFAULTS.VOLUME

        this._nextZeroTime = 0
        this.bpm = bpm || DEFAULTS.BPM
        if (AudioCore.powerMode === "low") {
            window.addEventListener("blur", () => { this.pauseScheduling() })
        }
        this.onReady = typeof onReady === "function" && onReady
        this.onError = typeof onError === "function" && onError
        this.isError = false
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
        this.commonGain.gain.setValueAtTime(this._volume, 0)
        return false
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
        if(elem.terminal.length > 0){
            elem.terminal[elem.terminal.length - 1].forEach(t => {
                t.connect(this.commonGain)
            })
        }
        elem.initialize()
        ElementPool.retrieve( elem )
        return false
    }

    /*
      @_routine
      - 各partに対してobserveを行う
      */
    _routine(o = {}) {
        const offlineConnect = o.offlineConnect
        const offlineContext = o.offlineContext
        let collected, elements
        this.parts.forEach(p => {
            elements = p.collect( offlineContext )
            if (elements && elements.length > 0){
                collected = collected || []
                collected = collected.concat(elements)
            }
        })
        if(!collected || collected.length === 0) return false
        collected.forEach( offlineConnect || (elem =>{ this._connect(elem) }) )
        return false
    }

}

export default Ongaq
