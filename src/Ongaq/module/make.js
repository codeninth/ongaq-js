import makeAudioBuffer from "./make/makeAudioBuffer"
import makeDelay from "./make/makeDelay"
import makePanner from "./make/makePanner"

//=============================
const make = (name, option, offlineContext )=>{
    switch(name){
        case "audiobuffer": return makeAudioBuffer(option, offlineContext)
        case "delay": return makeDelay(option, offlineContext)
        case "panner": return makePanner(option, offlineContext)
    default: return null
    }
}

export default make
