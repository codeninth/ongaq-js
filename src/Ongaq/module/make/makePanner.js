import AudioCore from "../AudioCore"
const v = {
    w: window.innerWidth,
    h: window.innerHeight,
}

const _setListener = ctx => {
    const l = ctx.listener

    if (l.forwardX) {
        l.forwardX.setValueAtTime(0, ctx.currentTime)
        l.forwardY.setValueAtTime(0, ctx.currentTime)
        l.forwardZ.setValueAtTime(-1, ctx.currentTime)
        l.upX.setValueAtTime(0, ctx.currentTime)
        l.upY.setValueAtTime(1, ctx.currentTime)
        l.upZ.setValueAtTime(0, ctx.currentTime)
    } else {
        l.setOrientation(0, 0, -1, 0, 1, 0)
    }

    if (l.positionX) {
        l.positionX.value = v.w / 2
        l.positionY.value = v.h / 2
        l.positionZ.value = 300
    } else {
        l.setPosition(v.w / 2, v.h / 2, 300)
    }
    l.__initByOngaq = true
}

const makePanner = ({ x }, ctx)=>{
    if(!ctx.listener.__initByOngaq) _setListener( ctx )
    const p = ctx.createPanner()
    p.refDistance = 1000
    p.maxDistance = 10000
    p.coneOuterGain = 1

    const _o = [1, 0, 0]
    if(p.orientationX) {
        p.orientationX.setValueAtTime(_o[0], ctx.currentTime)
        p.orientationY.setValueAtTime(_o[1], ctx.currentTime)
        p.orientationZ.setValueAtTime(_o[2], ctx.currentTime)
    } else {
        p.setOrientation(..._o)
    }

    const xValue = ((_x)=>(typeof _x === "number" && _x >= -90 && _x <= 90) ? _x : 0)( x )
    // mastering in case of width: 1000px -> multiply ratio (1000/v.w)
    const _p = [v.w / 2 + (1000 / v.w) * v.w / 90 * xValue / 52, v.h / 2, 299 ]

    if(p.positionX){
        p.positionX.setValueAtTime(_p[0], ctx.currentTime)
        p.positionY.setValueAtTime(_p[1], ctx.currentTime)
        p.positionZ.setValueAtTime(_p[2], ctx.currentTime)
    } else {
        p.setPosition(..._p)
    }

    return p

}

export default makePanner
