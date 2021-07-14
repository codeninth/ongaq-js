import Helper from "../Helper"
import BufferYard from "../BufferYard"
import AudioCore from "../AudioCore"
import defaults from "../defaults"
import isDrumNoteName from "../isDrumNoteName"
import gainPool from "../pool.gain"

const RETRIEVE_INTERVAL = 4

const gainGarage = new Map()
const bufferSourceGarage = new Map()
let periods = [2, 3, 4, 5].map(n => n * RETRIEVE_INTERVAL + AudioCore.context.currentTime)
periods.forEach(p => {
    gainGarage.set(p, [])
    bufferSourceGarage.set(p, [])
})
const addPeriod = minimum => {
    const nextPeriod = minimum + RETRIEVE_INTERVAL
    periods = periods.slice(1)
    periods.push(nextPeriod)
    gainGarage.set(nextPeriod, [])
    bufferSourceGarage.set(nextPeriod, [])
    return nextPeriod
}

const retrieve = ctx => {
    if (periods[0] > ctx.currentTime) return false
    for (let i = 0, l = periods.length; i < l; i++) {
        if (periods[i] > ctx.currentTime) continue
        gainGarage.get(periods[i]) && gainGarage.get(periods[i]).forEach(usedGain => {
            usedGain.disconnect()
            if (usedGain.context === ctx) {
                // when right after context is switched from offline to normal, gainNodes in the garage can not be reused
                gainPool.retrieve(usedGain)
            }
        })
        bufferSourceGarage.get(periods[i]) && bufferSourceGarage.get(periods[i]).forEach(usedSource => {
            usedSource.disconnect()
        })
        gainGarage.delete(periods[i])
        bufferSourceGarage.delete(periods[i])
        addPeriod(periods[l - 1])
    }
    return false
}

const makeAudioBuffer = ({ buffer, volume }, ctx) => {

    if (ctx instanceof (window.AudioContext || window.webkitAudioContext)) retrieve(ctx)
    let audioBuffer = BufferYard.ship(buffer)
    if (!audioBuffer) return false

    let s = ctx.createBufferSource()
    s.length = buffer.length
    s.buffer = audioBuffer[0]
    let g = gainPool.allocate(ctx)
    g.gain.setValueAtTime(AudioCore.SUPPRESSION * ((typeof volume === "number" && volume >= 0 && volume < 1) ? volume : defaults.NOTE_VOLUME), 0)
    // Set end of sound unless the instrument is drums
    !isDrumNoteName(buffer.key) && g.gain.setValueCurveAtTime(
        Helper.getWaveShapeArray(volume),
        buffer.startTime + buffer.length - (0.03 < buffer.length ? 0.03 : buffer.length * 0.6),
        0.03 < buffer.length ? 0.03 : buffer.length * 0.6
    )
    s.connect(g)
    s.start(buffer.startTime)

    if (!(ctx instanceof (window.AudioContext || window.webkitAudioContext))) return g

    // when normal audioContext, cache node to disconnect after used
    for (let i = 0, l = periods.length; i < l; i++) {
        if (buffer.startTime + buffer.length + 0.1 < periods[i]) {
            gainGarage.get(periods[i]).push(g)
            bufferSourceGarage.get(periods[i]).push(s)
            break
        }
        if (i === l - 1) {
            const nextPeriod = addPeriod(buffer.startTime + buffer.length + 0.1)
            gainGarage.get(nextPeriod).push(g)
            bufferSourceGarage.get(nextPeriod).push(s)
        }
    }
    return g

}

export default makeAudioBuffer