const Module = (()=>{

    const context = new (window.AudioContext || window.webkitAudioContext)()
    const originTime = new Date().getTime()

    class AudioCore {

        getContext(){ return context }
        getOriginTime(){ return originTime }

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
