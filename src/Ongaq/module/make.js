import AudioCore from "./AudioCore"
import makeAudioBuffer from "./make/makeAudioBuffer"
import makeDelay from "./make/makeDelay"
import makePanner from "./make/makePanner"

//=============================
const make = (name, option, context )=>{
    switch(name){
        case "audiobuffer": return makeAudioBuffer(option, context || AudioCore.context )
        case "delay": return makeDelay(option, context || AudioCore.context)
        case "panner": return makePanner(option, context || AudioCore.context)
    default: return null
    }
}

export default make
