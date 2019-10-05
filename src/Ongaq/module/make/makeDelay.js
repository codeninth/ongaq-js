import AudioCore from "../AudioCore"
const context = AudioCore.context

const makeDelay = ({ delayTime })=>{

    let d = context.createDelay()
    d.delayTime.value = delayTime

    return {
        terminal: d,
        initizalize: ()=>{}
    }

}


export default makeDelay
