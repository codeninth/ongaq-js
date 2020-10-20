const spaceWidth = window.innerWidth
const spaceHeight = window.innerHeight

const _setListener = ctx => {
    const l = ctx.listener // 625.5, 325, 300
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
        l.positionX.value = spaceWidth / 2
        l.positionY.value = spaceHeight / 2
        l.positionZ.value = 300
    } else {
        l.setPosition(spaceWidth / 2, spaceHeight / 2, 300)
    }
    return ctx
}

const context = _setListener(
    new(window.AudioContext || window.webkitAudioContext)()
)
const originTime = new Date().getTime()
const powerMode = (() => {
    let u = window.navigator.userAgent
    if (["iPhone", "iPad", "iPod", "Android"].some(name => u.indexOf(name) !== -1)) return "low"
    else return "middle"
})()

const AudioCore = {

    context,
    originTime,
    powerMode,
    SUPPRESSION: 0.5, // To avoid noise, suppress volume with this value
    toAudioBuffer: ({ src, length, arrayBuffer }) => {
        if (
            (!arrayBuffer && (!src || !length)) ||
            arrayBuffer && arrayBuffer instanceof ArrayBuffer === false
        ){
            return false
        }

        return new Promise( async (resolve, reject) => {
            try {
                let buffer
                if(!arrayBuffer){
                    buffer = new ArrayBuffer(length)
                    let bufView = new Uint8Array(buffer)
                    for (let i = 0; i < length; i++) bufView[i] = src.charCodeAt(i)
                } else {
                    buffer = arrayBuffer
                }
                context.decodeAudioData(
                    buffer,
                    buffer => buffer ? resolve(buffer) : reject(),
                    reject
                )
            } catch (err) {
                reject(err)
            }
        })

    },
    
    createOfflineContext: ({ seconds }) => {
        return _setListener(
            new OfflineAudioContext(2, 44100 * seconds, 44100)
        )
    },
    spaceWidth,
    spaceHeight
}



export default AudioCore