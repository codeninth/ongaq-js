import makeAudioBuffer from "./make/makeAudioBuffer"
import makeDelay from "./make/makeDelay"
import makePanner from "./make/makePanner"

//=============================
const make = ( name, option )=>{
  switch(name){
    case "audiobuffer": return makeAudioBuffer(option)
    case "delay": return makeDelay(option)
    case "panner": return makePanner(option)
    default: return null
  }
}

export default make
