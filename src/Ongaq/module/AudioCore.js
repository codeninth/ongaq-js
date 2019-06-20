const Module = (()=>{

    const context = new (window.AudioContext || window.webkitAudioContext)()
    const originTime = new Date().getTime()
    const powerMode = (()=>{
        let u = window.navigator.userAgent
        if (["iPhone", "iPad", "iPod","Android"].some( name=>u.indexOf(name) !== -1 )) return "low"
        else return "middle"
    })()

    class AudioCore {

        get context(){ return context }
        get originTime(){ return originTime }
        get powerMode(){ return powerMode }

        toAudioBuffer(o = {}){

            if(!o.src || !o.length) return false
            let resolve = typeof o.resolve === "function" ? o.resolve : null
            let reject = typeof o.reject === "function" ? o.reject : null

            try {
                let buffer = new ArrayBuffer(o.length)
                let bufView = new Uint8Array(buffer)
                for(let i = 0; i < o.length; i++) bufView[i] = o.src.charCodeAt(i)
                context.decodeAudioData(
                    buffer,
                    buffer=>{
                        if(!buffer) return reject && reject()
                        else resolve && resolve(buffer)
                    },
                    err=>{ return reject && reject(err) }
                )
            } catch(err) {
                return reject && reject(err)
            }

        }

    }

    return AudioCore

}).call(undefined,window || {})

export default new Module()
