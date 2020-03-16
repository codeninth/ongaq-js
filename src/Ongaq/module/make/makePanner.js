import AudioCore from "../AudioCore"

const makePanner = ({ x }, ctx) => {
    const p = ctx.createPanner()
    p.refDistance = 1000
    p.maxDistance = 10000
    p.coneOuterGain = 1

    const _o = [1, 0, 0]
    if (p.orientationX) {
        p.orientationX.setValueAtTime(_o[0], ctx.currentTime)
        p.orientationY.setValueAtTime(_o[1], ctx.currentTime)
        p.orientationZ.setValueAtTime(_o[2], ctx.currentTime)
    } else {
        p.setOrientation(..._o)
    }

    const xValue = ((_x) => (typeof _x === "number" && _x >= -90 && _x <= 90) ? _x : 0)(x)
    // mastering in case of width: 1000px -> multiply ratio (1000/AudioCore.spaceWidth)
    const _p = [AudioCore.spaceWidth / 2 + (1000 / AudioCore.spaceWidth) * AudioCore.spaceWidth / 90 * xValue / 52, AudioCore.spaceHeight / 2, 299]

    if (p.positionX) {
        p.positionX.setValueAtTime(_p[0], ctx.currentTime)
        p.positionY.setValueAtTime(_p[1], ctx.currentTime)
        p.positionZ.setValueAtTime(_p[2], ctx.currentTime)
    } else {
        p.setPosition(..._p)
    }

    return p

}

export default makePanner