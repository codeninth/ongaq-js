import AudioCore from "../AudioCore"
const context = AudioCore.context

const v = {
    w: window.innerWidth,
    h: window.innerHeight,
}
const l = context.listener

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

const makePanner = ({ x })=>{

    const p = context.createPanner()
    const _o = [1, 0, 0]
    if(p.orientationX) {
        p.orientationX.setValueAtTime(_o[0], context.currentTime)
        p.orientationY.setValueAtTime(_o[1], context.currentTime)
        p.orientationZ.setValueAtTime(_o[2], context.currentTime)
    } else {
        p.setOrientation(..._o)
    }

    const xValue = ((_x)=>(typeof _x === "number" && _x >= -90 && _x <= 90) ? _x : 0)( x )
    const _p = [v.w / 2 + xValue, v.h / 2, 200]
    if(p.positionX){
        p.positionX.setValueAtTime(_p[0], context.currentTime)
        p.positionY.setValueAtTime(_p[1], context.currentTime)
        p.positionZ.setValueAtTime(_p[2], context.currentTime)
    } else {
        p.setPosition(..._p)
    }

    return p

}

export default makePanner
