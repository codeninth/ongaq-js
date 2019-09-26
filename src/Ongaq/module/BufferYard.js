import AudioCore from "./AudioCore"
import ROOT from "../../Constants/ROOT"
import DRUM_NOTE from "../../Constants/DRUM_NOTE"
import ENDPOINT from "../../Constants/ENDPOINT"
import request from "superagent"
import nocache from "superagent-no-cache"

let SOUND_NAME_MAP
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

        set({ api_key }){
            this.api_key = api_key
            
            request
                .get(`${ENDPOINT}/soundnamemap/`)
                .then(result=>{
                    if (!result || result.body.statusCode !== 200){
                      throw new Error("Cannot download instrumental master data.")
                    }
                    SOUND_NAME_MAP = new Map(result.body.data)
                })
                .catch(()=>{
                  throw new Error("Cannot download instrumental master data.")
                })
            
        }

        get endpoint(){
            return `${ENDPOINT}/sounds/`
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

                    request
                        .get(this.endpoint)
                        .query({
                            sound: sound,
                            api_key: this.api_key
                        })
                        .set("Content-Type", "application/json")
                        .use(nocache)
                        .then(res => {
                            let result, data
                            result = res.body.sounds[0]
                            if (!result || result.status !== "OK") return reject()
                            data = typeof result.data === "string" ? JSON.parse(result.data) : result.data

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
                            reject(`Cannot load sound resources. There are 3 possible reasons: 1) Some of [ ${soundsToLoad.join(",")} ] is/are invalid instrumental name. 2) Some of them is/are not free and you don't have a pro license. 3) [ ${this.api_key} ] is not a valid API key.`)
                        })

                })


            })

            return Promise.all(promises)

        }

        ship({ sound, key }){
            if(!sound || !key || !buffers.get(sound)) return false
            /*
                readable note name as "A1","hihat" will be converted here
            */
            const soundID = SOUND_NAME_MAP.get(sound) && SOUND_NAME_MAP.get(sound).id
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
