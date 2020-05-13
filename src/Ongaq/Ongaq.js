import AudioCore from "./module/AudioCore"
import BufferYard from "./module/BufferYard"
import Helper from "./module/Helper"
import DEFAULTS from "./module/defaults"
import ElementPool from "./module/pool.element"
import GainPool from "./module/pool.gain"
import PanPool from "./module/pool.pan"
import make from "./module/make"
import PanFunctionPool from "./module/pool.panfunction"
import DelayPool from "./module/pool.delay"
import DelayFunctionPool from "./module/pool.delayfunction"
import DRUM_NOTE from "../Constants/DRUM_NOTE"
import ROOT from "../Constants/ROOT"
import SCHEME from "../Constants/SCHEME"
import VERSION from "../Constants/VERSION"

const flushAll = ()=>{
    GainPool.flush()
    ElementPool.flush()
    PanPool.flush()
    PanFunctionPool.flush()
    DelayPool.flush()
    DelayFunctionPool.flush()
}
class Ongaq {

    constructor(o) {
        this._init(o)
    }

    /*
      @add
    */
    add(part) {

        return new Promise(async(resolve, reject) => {

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
                if (isAllPartsLoaded) {
                    if (!this.allPartsLoadedOnce) this.onReady && this.onReady()
                    this.allPartsLoadedOnce = true
                }
                resolve()
            } catch (e) {
                if (!this.isError) {
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

        if (!this.commonGain) this.commonGain = this._getCommonGain(AudioCore.context)

        this.parts.forEach(p => { p._putTimerRight(AudioCore.context.currentTime) })

        this._scheduler = window.setInterval(() => {
            this._routine(
                AudioCore.context,
                elem => { this._connect(elem) }
            )
        }, AudioCore.powerMode === "middle" ? 50 : 200)
        return false
    }

    test(o = {}){
        if (!o.key || !o.sound) return false
        try {
          const keys = Array.isArray(o.key) ? o.key : [o.key]
          const step = o.step > 0 ? o.step : 0
          const ab = keys.map((key,i)=>{
            return make("audiobuffer", {
                buffer: {
                    sound: o.sound,
                    length: 1.5,
                    key,
                    startTime: (AudioCore.context.currentTime + 0.1) + i * step
                },
                volume: 1
            }, AudioCore.context)
          }).filter(_=>_)
          const g = this._getCommonGain(AudioCore.context)
          ab.map(_=>_.connect(g))
        } catch (e) {
            return false
        }
    }

    record(o = {}) {
        if (this.isPlaying) throw "cannot start recording while playing sounds"
        else if (this.isRecording) throw "cannot start recording while other recording process ongoing"
        else if (!window.OfflineAudioContext) throw "OfflineAudioContext is not supported"
        if (this.isPlaying || this.parts.size === 0) return false

        return new Promise(async(resolve, reject) => {
            try {

                this.isRecording = true
                flushAll()
                // ====== calculate the seconds of beats beforehand
                const secondSamples = []
                this.parts.forEach(p => {
                  p._reset()
                  p._putTimerRight(0)
                  const _maxLap = (typeof o.maxLap === "number" && o.maxLap > 0) ? o.maxLap : p.maxLap
                  secondSamples.push(_maxLap * p.measure * p._beatsInMeasure * p._secondsPerBeat)
                })
                const seconds = (() => {
                  if (typeof o.seconds === "number" && o.seconds >= 1 && o.seconds <= DEFAULTS.WAV_MAX_SECONDS) return o.seconds
                  else if (Math.max(secondSamples) < 1) return 1
                  else if (Math.max(secondSamples) < DEFAULTS.WAV_MAX_SECONDS) return Math.max(secondSamples)
                  else return DEFAULTS.WAV_MAX_SECONDS
                })()
                const margin = typeof o.margin === "number" && o.margin >= 1 ? o.margin : 0
                const offlineContext = AudioCore.createOfflineContext({ seconds: seconds + margin < DEFAULTS.WAV_MAX_SECONDS ? seconds + margin : DEFAULTS.WAV_MAX_SECONDS })
                // =======
                const commonGain = this._getCommonGain(offlineContext)

                this._routine(
                  offlineContext,
                  elem => {
                    if (elem.terminal.length > 0) {
                      elem.terminal[elem.terminal.length - 1].forEach(t => {
                        t && t.connect && t.connect(commonGain)
                      })
                    }
                    elem.initialize()
                    ElementPool.retrieve(elem)
                  }
                )

                const buffer = await offlineContext.startRendering()
                this.isRecording = false
                resolve(buffer)
            } catch (e) {
                this.isRecording = false
                reject(e)
            } finally {
                flushAll()
            }
        })
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
            if (tags.every(tag => p.tags.includes(tag))) result.push(p)
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
            currentTime: AudioCore.context.currentTime,
            volume: this.volume
        }
    }

    get context() {
        return AudioCore.context
    }

    get constants() {
        return {
            DRUM_NOTE,
            ROOT,
            SCHEME
        }
    }

    get soundNameMap() {
        return BufferYard.getSoundNameMap()
    }

    get version() { return VERSION }

    set volume(v) {
        if (typeof v !== "number" || v < 0 || v > 100) return false
        this._volume = v / 100 * AudioCore.SUPPRESSION
        this.commonGain && this.commonGain.gain.setValueAtTime(
            this._volume,
            AudioCore.context.currentTime + 0.01
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

    _init({ api_key, volume, bpm, onReady, onError }) {
        this.parts = new Map()
        this.isPlaying = false
        this.isRecording = false
        this.allPartsLoadedOnce = false
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
      @_getCommonGain
      - すべてのaudioNodeが経由するGainNodeを作成
      - playのタイミングで毎回作り直す
    */
    _getCommonGain(ctx) {
        const comp = ctx.createDynamicsCompressor()
        comp.connect(ctx.destination)
        const g = ctx.createGain()
        g.connect(comp)
        g.gain.setValueAtTime(this._volume, 0)
        return g
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
        if (elem.terminal.length > 0) {
            elem.terminal[elem.terminal.length - 1].forEach(t => {
                t.connect(this.commonGain)
            })
        }
        elem.initialize()
        ElementPool.retrieve(elem)
        return false
    }

    /*
      @_preloadSound
    */
    _preloadSound({ sound }) {
        return BufferYard.import({ sound })
    }

    /*
      @_routine
      - 各partに対してobserveを行う
      */
    _routine(ctx, connect) {
        let collected, elements
        this.parts.forEach(p => {
            elements = p.collect(ctx)
            if (elements && elements.length > 0) {
                collected = collected || []
                collected = collected.concat(elements)
            }
        })
        if (!collected || collected.length === 0) return false
        collected.forEach(connect)
        return false
    }

}

export default Ongaq