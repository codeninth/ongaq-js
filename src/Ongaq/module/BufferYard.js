import AudioCore from "./AudioCore"
import ROOT from "../../Constants/ROOT"
import DRUM_NOTE from "../../Constants/DRUM_NOTE"
import ENDPOINT from "../../Constants/ENDPOINT"
import request from "superagent"
import nocache from "superagent-no-cache"
let SOUND_NAME

/*
    convert key name expression
    e.g.) "A1#" -> "1$11"
*/
const toPianoNoteName = (()=>{
    const r = /^([A-Z])+([1-4])+(b|\#)?$/

    return (raw = "") =>{
        if( r.test(raw) === false ){
            return raw
        } else {
            const result = r.exec(raw)
            /*
                g1: C,D,E...A,B
                g2: 1,2,3,4
                g3: undefined, b, #
                */
            if(!result || !ROOT.get(result[1]) ) return raw
            return `${ result[2] }$${ROOT.get( result[1] + (result[3] || "") )}`
        }
    }

})()

/*
    convert key name expression
    e.g.) "hihat" -> "1$5"
*/
const toDrumNoteName = (raw = "") =>{
    return DRUM_NOTE.get(raw) || raw
}

let buffers = new Map()

const Module = (()=>{

    class BufferYard {

        set({ apiKey, offline, resource, soundNameMap }){
            this.apiKey = apiKey
            this.offline = offline === true
            this.resource = resource || "/v1/sounds/"
            if (soundNameMap instanceof Map){
                SOUND_NAME = soundNameMap
            } else {
                request.get(`${this.endpoint}/v1/soundnamemap/`)
                    .set("Content-Type", "application/json")
                    .use(nocache)
                    .then(res=>{
                        SOUND_NAME = new Map(res.body)
                    })
            }
        }

        get endpoint(){
            if (this.offline === false) return `${ENDPOINT}${this.resource}`
            else return `${this.resource}`
        }

        /*
          - load soundjsons with SoundFile API
          - restore mp3: string -> typedArray -> .mp3
        */
        import(sounds){

            if(!Array.isArray(sounds)) return false

            const soundsToLoad = sounds.filter( sound => !buffers.get(sound) )
            if(soundsToLoad.length === 0) return new Promise(r=>r())

            let promises = soundsToLoad.map((sound)=>{

                return new Promise((resolve, reject) => {

                    let thisRequest
                    if(this.offline === false){
                        thisRequest = request
                            .get(this.endpoint)
                            .query({
                                sound: sound,
                                apiKey: this.apiKey
                            })
                    } else {
                        thisRequest = request
                            .get(`${this.endpoint}${SOUND_NAME.get(sound) && SOUND_NAME.get(sound).id}.json`)
                    }

                    thisRequest
                        .set("Content-Type", "application/json")
                        .use(nocache)
                        .then(res => {
                            let result, data
                            if(this.offline === false){
                                result = res.body.sounds[0]
                                if (!result || result.status !== "OK") return reject()
                                data = typeof result.data === "string" ? JSON.parse(result.data) : result.data
                            } else {
                                //  When offline, read JSON directly
                                data = res.body
                            }

                            let notes = Object.keys(data.note)
                            let thisSoundBuffers = new Map()
                            let decodedBufferLength = 0

                            notes.forEach(key => {

                                let thisNote = data.note[key]

                                AudioCore.toAudioBuffer({
                                    src: thisNote.src,
                                    length: thisNote.length
                                })
                                .then(audioBuffer => {
                                    thisSoundBuffers.set(key, audioBuffer)
                                    if (++decodedBufferLength === notes.length) {
                                        notes = null
                                        buffers.set(sound, thisSoundBuffers)
                                        resolve()
                                    }
                                })
                                .catch(() => {
                                    soundsToLoad.forEach(sound => {
                                        if (buffers.has(sound)) buffers.delete(sound)
                                    })
                                    reject()
                                })
                            })


                        })
                        .catch(() => {
                            soundsToLoad.forEach(sound => buffers.delete(sound))
                            reject(`Cannot load sound resources. There are 3 possible reasons: 1) Some of [ ${soundsToLoad.join(",")} ] is/are invalid instrumental name. 2) Some of them is/are not free and you don't have a pro license. 3) [ ${this.apiKey} ] is not a valid API key.`)
                        })

                })


            })

            return Promise.all(promises)

        }

        ship({ sound, key }){
            if (!SOUND_NAME || !sound || !key || !buffers.get(sound)) return false

            /*
                readable note name as "A1","hihat" will be converted here
            */
            const soundID = SOUND_NAME.get(sound) && SOUND_NAME.get(sound).id
            if(soundID < 20000) key = toPianoNoteName(key)
            else if(soundID < 30000) key = toDrumNoteName(key)

            if(Array.isArray(key)){
                return key.map(k=>buffers.get(sound).get(k)).filter(b=>b)
            } else if(typeof key === "string") {
                return [ buffers.get(sound).get(key) ]
            } else {
                return []
            }
        }

    }

    return BufferYard

}).call(undefined,window || {})

export default new Module()
