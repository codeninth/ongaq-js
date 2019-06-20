import AudioCore from "../AudioCore"
import SoundLine from "../SoundLine"

const context = AudioCore.context

//=============================

const delayLine = ({ delayTime, targetIndex })=>{

    let d = context.createDelay()
    d.delayTime.value = delayTime

    return new SoundLine({
        delayNode: d,
        loader: (layer,layerIndex)=>{
            if(layerIndex === 0 || !layer[layerIndex-1]) return false
            layer[layerIndex-1] && layer[layerIndex-1].instance[targetIndex].output && layer[layerIndex-1].instance[targetIndex].output.connect(d)
            layer[layerIndex] && d.connect(layer[layerIndex].output)
        },
        starter: null
    })

}

export default delayLine
