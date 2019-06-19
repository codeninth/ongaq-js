import AudioCore from "../AudioCore"
import SoundLine from "../SoundLine"

const context = AudioCore.context
//=============================

const pannerLine = (({ innerWidth, innerHeight })=>{

    let v = {
        w: innerWidth,
        h: innerHeight
    }

    let l = context.listener

    if(l.forwardX) {
        l.forwardX.setValueAtTime(0, context.currentTime)
        l.forwardY.setValueAtTime(0, context.currentTime)
        l.forwardZ.setValueAtTime(-1, context.currentTime)
        l.upX.setValueAtTime(0, context.currentTime)
        l.upY.setValueAtTime(1, context.currentTime)
        l.upZ.setValueAtTime(0, context.currentTime)
    } else {
        l.setOrientation(0,0,-1,0,1,0)
    }

    if(l.positionX){
        l.positionX.value = v.w / 2
        l.positionY.value = v.h / 2
        l.positionZ.value = 200
    } else {
        l.setPosition(v.w / 2,v.h / 2,200)
    }

    return data=>{
        if(data.targetIndex > 0) return false
        const p = context.createPanner()
        const _o = [1, 0, 0]
        if(p.orientationX) {
            p.orientationX.setValueAtTime(_o[0], context.currentTime)
            p.orientationY.setValueAtTime(_o[1], context.currentTime)
            p.orientationZ.setValueAtTime(_o[2], context.currentTime)
        } else {
            p.setOrientation(..._o)
        }

        let x = ((_x)=>(typeof _x === "number" && _x >= -90 && _x <= 90) ? _x : 0)( data.positionX )
        const _p = [v.w / 2 + x, v.h / 2, 200]
        if(p.positionX){
          p.positionX.setValueAtTime(_p[0], context.currentTime)
          p.positionY.setValueAtTime(_p[1], context.currentTime)
          p.positionZ.setValueAtTime(_p[2], context.currentTime)
        } else {
          p.setPosition(..._p)
        }
        
        return new SoundLine({
            pannerNode: p,
            loader: (layer,layerIndex)=>{
                if(layerIndex === 0 || !layer[layerIndex-1]) return false
                layer[layerIndex-1].output.connect(p)
                layer[layerIndex] && p.connect(layer[layerIndex].output)
            },
            starter: null
        })

    }

}).call(null,window)


export default pannerLine
