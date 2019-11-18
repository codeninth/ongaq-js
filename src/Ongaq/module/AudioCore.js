const context = new (window.AudioContext || window.webkitAudioContext)()
const originTime = new Date().getTime()
const powerMode = (()=>{
    let u = window.navigator.userAgent
    if (["iPhone", "iPad", "iPod","Android"].some( name=>u.indexOf(name) !== -1 )) return "low"
    else return "middle"
})()

const AudioCore = {

    context,
    originTime,
    powerMode,
    SUPPRESSION: 0.5, // To avoid noise, suppress volume with this value
    toAudioBuffer: ({ src, length })=>{

        if(!src || !length) return false
        return new Promise((resolve,reject)=>{
            try {
                let buffer = new ArrayBuffer(length)
                let bufView = new Uint8Array(buffer)
                for (let i = 0; i < length; i++) bufView[i] = src.charCodeAt(i)
                context.decodeAudioData(
                    buffer,
                    buffer => buffer ? resolve(buffer) : reject(),
                    reject
                )
            } catch (err) {
                return reject(err)
            }
        })

    }

}



export default AudioCore
