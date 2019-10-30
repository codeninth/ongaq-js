import Helper from "../Helper"
import BufferYard from "../BufferYard"
import AudioCore from "../AudioCore"
import defaults from "../defaults"
import isDrumNoteName from "../isDrumNoteName"
import gainPool from "../pool.gain"
const context = AudioCore.context

const RETRIEVE_INTERVAL = 4

let periods = [ 2, 3, 4, 5 ].map(n => n * RETRIEVE_INTERVAL + context.currentTime)
const gainGarage = new Map()
const bufferSourceGarage = new Map()

const addPeriod = ()=>{
    const nextPeriod = periods[periods.length - 1] + RETRIEVE_INTERVAL
    periods = periods.slice(1)
    periods.push(nextPeriod)
    gainGarage.set(nextPeriod, [])
    bufferSourceGarage.set(nextPeriod, [])
    console.log(nextPeriod)
    return nextPeriod
}
const retrieve = currentTime =>{
    if(periods[0] < currentTime) return false
    for(let i = 0, l = periods.length; i<l; i++){
        if(periods[i] > currentTime) continue
        gainGarage.get(periods[i]).forEach(usedGain => {
            usedGain.disconnect()
            gainPool.retrieve(usedGain)
        })
        bufferSourceGarage.get(periods[i]).forEach(usedSource => {
            usedSource.disconnect()
        })
        console.log("addPeriod @retrieve")
        addPeriod()
        gainGarage.delete(periods[i])
        bufferSourceGarage.delete(periods[i])
    }
    return false
}

const makeAudioBuffer = ({ buffer, volume })=>{

    retrieve(context.currentTime)

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
    
    for(let i = 0, l = periods.length; i<l; i++){
        if (buffer.startTime + buffer.length + 0.1 < periods[i]){
            gainGarage.get( periods[i] ).push(g)
            bufferSourceGarage.get( periods[i] ).push(s)
            break
        }
        if(i === l-1){
            console.log("addPeriod @make")
            const nextPeriod = addPeriod()
            gainGarage.get( nextPeriod ).push(g)
            bufferSourceGarage.get( nextPeriod ).push(s)
        }
    }
    return g

}

export default makeAudioBuffer
