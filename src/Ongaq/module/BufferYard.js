import AudioCore from "./AudioCore"
import ENDPOINT from "../../Constants/ENDPOINT"
import toPianoNoteName from "./toPianoNoteName"
import toDrumNoteName from "./toDrumNoteName"
import Cacher from "./Cacher"
import request from "superagent"
import nocache from "superagent-no-cache"
let buffers = new Map()

class BufferYard {

    constructor(){
        this.soundNameMap = new Map()
    }

    set({ api_key }) {
        this.api_key = api_key
        let cache = Cacher.get("soundNameMap")
        if(!cache){
            request
                .get(`${ENDPOINT}/soundnamemap/`)
                .then(result => {
                    if (!result || result.body.statusCode !== 200) {
                        throw new Error("Cannot download instrumental master data.")
                    }
                    this.soundNameMap = new Map(result.body.data)
                    const stringified = result.body.data.map(d => `${d[0]}$${JSON.stringify(d[1])}`).join("|")
                    Cacher.set("soundNameMap", stringified)
                })
                .catch(() => {
                    throw new Error("Cannot download instrumental master data.")
                })
        } else {
            /*
                use cached string like sound_1,10001|sound_b,10002
            */
           try {
               cache = cache.split("|")
               cache = cache.map(pair => {
                   const array = pair.split("$")
                   return [array[0], JSON.parse(array[1])]
               })
               this.soundNameMap = new Map(cache)
           } catch(e) {
               Cacher.purge("soundNameMap")
               throw new Error("Cannot download instrumental master data.")
           }

        }

    }

    /*
      - load soundjsons with SoundFile API
      - restore mp3: string -> typedArray -> .mp3
    */
    async import({ sound }) {

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

                    notes.forEach(async key => {

                        let thisNote = data.note[key]
                        try {
                            let audioBuffer = await AudioCore.toAudioBuffer({
                                src: thisNote.src,
                                length: thisNote.length
                            })
                            thisSoundBuffers.set(key, audioBuffer)
                            if (++decodedBufferLength === notes.length) {
                                notes = null
                                buffers.set(sound, thisSoundBuffers)
                                resolve()
                            }
                        } catch(e){
                            if (buffers.has(sound)) buffers.delete(sound)
                            reject()
                        }

                    })


                })
                .catch(() => {
                    if (buffers.has(sound)) buffers.delete(sound)
                    reject(`Cannot load sound resources. There are 4 possible reasons: 1) [ ${sound} ] is invalid as an instrumental name. 2) [ ${sound} ] is not free and you don't have a pro license. 3) Your remote IP address or hostname is not registered as an authorized origin at dashboard. 4) [ ${this.api_key} ] is not a valid API key.`)
                })

        })

    }

    ship({ sound, key }) {
        if (!sound || !buffers.get(sound)) return false
        /*
            readable note name as "A1","hihat" will be converted here
        */
        const soundID = this.soundNameMap.get(sound) && this.soundNameMap.get(sound).id
        if(!key) return buffers.get(sound)

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
