import AudioCore from "../AudioCore"
const context = AudioCore.context

const makeDelay = ({ delayTime }, offlineContext )=>{

    let d = (offlineContext || context).createDelay()
    d.delayTime.value = delayTime

    return d

}


export default makeDelay
