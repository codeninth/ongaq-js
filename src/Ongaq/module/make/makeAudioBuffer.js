import Helper from "../Helper"
import BufferYard from "../BufferYard"
import AudioCore from "../AudioCore"
const context = AudioCore.context

const makeAudioBuffer = ({ buffer, volume })=>{

    let audioBuffer = BufferYard.ship(buffer)
    if(!audioBuffer) return false

    let s = context.createBufferSource()
    s.length = buffer.length
    s.buffer = audioBuffer[0]

    let g = context.createGain()
    g.gain.setValueAtTime( AudioCore.SUPPRESSION * (( volume && volume >= 0 && volume < 1) ? volume : 1), 0 )
    g.gain.setValueCurveAtTime(
        Helper.getWaveShapeArray(volume),
        buffer.startTime + buffer.length - ( 0.04 < buffer.length ? 0.04 : buffer.length * 0.6),
        0.04 < buffer.length ? 0.04 : buffer.length * 0.6
    )
    s.start(buffer.startTime)
    s.connect(g)

    return g

}

export default makeAudioBuffer
