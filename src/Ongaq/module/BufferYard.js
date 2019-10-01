import AudioCore from "./AudioCore"
import ENDPOINT from "../../Constants/ENDPOINT"
import toPianoNoteName from "./toPianoNoteName"
import toDrumNoteName from "./toDrumNoteName"
import request from "superagent"
import nocache from "superagent-no-cache"

let buffers = new Map()

class BufferYard {

    constructor(){
        this.soundNameMap = new Map()
    }

    set({ api_key }) {
        this.api_key = api_key
        request
            .get(`${ENDPOINT}/soundnamemap/`)
            .then(result => {
                if (!result || result.body.statusCode !== 200) {
                    throw new Error("Cannot download instrumental master data.")
                }
                this.soundNameMap = new Map(result.body.data)
            })
            .catch(() => {
                throw new Error("Cannot download instrumental master data.")
            })
    }

    /*
      - load soundjsons with SoundFile API
      - restore mp3: string -> typedArray -> .mp3
    */
    import(sound) {

        return new Promise((resolve, reject) => {
            // this sound is already loaded
            if (buffers.get(sound)) return resolve()
            
            request
                .get(`${ENDPOINT}/sounds/`)
                .query({
                    sound: sound,
                    api_key: this.api_key
                })
                .set("Content-Type", "application/json")
                .use(nocache)
                .then(res => {

                    let result = res.body.sounds[0]
                    if (!result || result.status !== "OK") return reject()
                    let data = typeof result.data === "string" ? JSON.parse(result.data) : result.data

                    let notes = Object.keys(data.note)
                    let thisSoundBuffers = new Map()
                    let decodedBufferLength = 0

                    notes.forEach(key => {

                        let thisNote = data.note[key]

                        AudioCore
                        .toAudioBuffer({
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
                            if (buffers.has(sound)) buffers.delete(sound)
                            reject()
                        })
                    })


                })
                .catch(() => {
                    if (buffers.has(sound)) buffers.delete(sound)
                    reject(`Cannot load sound resources. There are 3 possible reasons: 1) [ ${sound} ] is invalid instrumental name. 2) [ ${sound} ] is not free and you don't have a pro license. 3) [ ${this.api_key} ] is not a valid API key.`)
                })

        })

    }

    ship({ sound, key }) {
        if (!sound || !key || !buffers.get(sound)) return false
        /*
            readable note name as "A1","hihat" will be converted here
        */
        const soundID = this.soundNameMap.get(sound) && this.soundNameMap.get(sound).id
        if (soundID < 20000) key = toPianoNoteName(key)
        else if (soundID < 30000) key = toDrumNoteName(key)
        
        if (Array.isArray(key)) {
            return key.map(k => buffers.get(sound).get(k)).filter(b => b)
        } else if (typeof key === "string") {
            return [buffers.get(sound).get(key)]
        } else {
            return []
        }
    }

}

export default new BufferYard()
