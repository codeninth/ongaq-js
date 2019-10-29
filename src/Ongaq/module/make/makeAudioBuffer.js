import Helper from "../Helper"
import BufferYard from "../BufferYard"
import AudioCore from "../AudioCore"
import defaults from "../defaults"
import isDrumNoteName from "../isDrumNoteName"
import gainPool from "../pool.gain"
const context = AudioCore.context

let period = context.currentTime + 5
let nextKey = "left"
let otherKey = "right"
let gainGarage = {
    left: [],
    right: []
}
let bufferSourceGarage = {
    left: [],
    right: []
}

const makeAudioBuffer = ({ buffer, volume })=>{

    if(period < context.currentTime){
        gainGarage[ nextKey ].forEach(usedGain=>{
            usedGain.disconnect()
            gainPool.retrieve( usedGain )
        })
        bufferSourceGarage[ nextKey ].forEach(usedSource=>{
            usedSource.disconnect()
            // usedSource = null
        })
        gainGarage[ nextKey ] = []
        bufferSourceGarage[ nextKey ] = []
        period = context.currentTime + 5
        nextKey = nextKey === "left" ? "right" : "left"
        otherKey = otherKey === "left" ? "right" : "left"
    }

    let audioBuffer = BufferYard.ship(buffer)
    if(!audioBuffer) return false

    let s = context.createBufferSource()
    s.length = buffer.length
    s.buffer = audioBuffer[0]

    let g = gainPool.allocate()
    g.gain.setValueAtTime( AudioCore.SUPPRESSION * (( volume && volume >= 0 && volume < 1) ? volume : defaults.NOTE_VOLUME ), 0 )
    // Set end of sound unless the instrument is drums
    !isDrumNoteName(buffer.key) && g.gain.setValueCurveAtTime(
        Helper.getWaveShapeArray(volume),
        buffer.startTime + buffer.length - ( 0.03 < buffer.length ? 0.03 : buffer.length * 0.6),
        0.03 < buffer.length ? 0.03 : buffer.length * 0.6
    )
    s.start(buffer.startTime)
    s.connect(g)
    
    if(buffer.startTime + buffer.length + 0.1 < period){
        gainGarage[ nextKey ].push(g)
        bufferSourceGarage[ nextKey ].push(s)
    } else {
        gainGarage[ otherKey ].push(g)
        bufferSourceGarage[ otherKey ].push(s)
    }
    return g

}

export default makeAudioBuffer
