import AudioCore from "../AudioCore"
const context = AudioCore.context

const makeDelay = ({ delayTime })=>{

    let d = context.createDelay()
    d.delayTime.value = delayTime

    return d

}


export default makeDelay
