import Helper from "../Helper"
import BufferYard from "../BufferYard"
import AudioCore from "../AudioCore"
import SoundLine from "../SoundLine"

const context = AudioCore.context

//=============================

const audioBufferLine = ({ buffer, volume })=>{

    let audioBuffer = BufferYard.ship(buffer)
    if(!audioBuffer) return false

    let s = context.createBufferSource()
    s.length = buffer.length
    s.buffer = audioBuffer[0]
    s.startTime = buffer.startTime || context.currentTime

    let g = context.createGain()
    g.gain.setValueAtTime( ( volume && volume >= 0 && volume < 1) ? volume : 1, 0 )
    g.gain.setValueCurveAtTime(
        Helper.getWaveShapeArray(volume),
        buffer.startTime + buffer.length - 0.02, 0.02
    )

    s.connect(g)

    return new SoundLine({
        name: "audioBufferLine",
        audioBufferNode: s,
        gainNode: g,
        loader: (layer,layerIndex)=>{
            layer[layerIndex] && g.connect(layer[layerIndex].output)
        },
        starter: ()=>{
            s.start(s.startTime)
        }
    })

}

export default audioBufferLine
