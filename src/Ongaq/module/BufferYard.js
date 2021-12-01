import AudioCore from "./AudioCore"
import ENDPOINT from "../../Constants/ENDPOINT"
import toPianoNoteName from "./toPianoNoteName"
import toDrumNoteName from "./toDrumNoteName"
import Cacher from "./Cacher"
import request from "superagent"
import nocache from "superagent-no-cache"
let buffers = new Map()

const cacheToMap = cache => {
    try {
        cache = cache.split("|")
        cache = cache.map(pair => {
            const array = pair.split("$")
            return [array[0], JSON.parse(array[1])]
        })
        return new Map(cache)
    } catch (e) {
        return null
    }
}

class BufferYard {

    constructor(){
        this.soundNameMap = new Map()
    }

    /*
        {
            sound: 'my-sound-name',
            data: {
                C1: ArrayBuffer,
                D2: ArrayBuffer
            }
        }
    */
    bringIn({ sound, data }){

        return new Promise((resolve,reject)=>{

            if(
                typeof sound !== "string" ||
                typeof data !== "object" ||
                !Object.keys(data).length === 0
            ){
                return reject("invalid options")
            } else if(
                (()=>{
                    const map = cacheToMap(Cacher.get("soundNameMap"))
                    return map && map.get(sound)
                })()
            ){
                return reject("cannot overwrite official instruments")
            }
    
            try {
                let thisSoundBuffers = buffers.get(sound) || new Map()
                const keys = Object.keys(data)
                keys.forEach( async _key=>{
                    // check if _key is valid note name as scalable instrument
                    let key
                    if(toPianoNoteName(_key) !== _key) key = toPianoNoteName(_key)
                    if(!key) return reject(`[ ${_key} ] is not a valid sound name of original instrument. Use as same notation as for piano like "C1" or "D2#".`)
                    // check if ArrayBuffer is assigned
                    if( (data[_key] instanceof ArrayBuffer) === false) return reject(`value corresponding to [ ${_key} ] must be an ArrayBuffer instance`)
                    
                    const audioBuffer = await AudioCore.toAudioBuffer({
                        arrayBuffer: data[_key]
                    })
                    thisSoundBuffers.set(key, audioBuffer)
                })
                buffers.set(sound,thisSoundBuffers)
                resolve()
            } catch(e){
                reject("invalid options")
            }
        })
        
    }

    getSoundNameMap(){
        try {
            const map = cacheToMap(Cacher.get("soundNameMap"))
            // replace instrument id with its type
            map.forEach(dict=>{
                if (dict.id < 20000) dict.type = "scalable"
                else if (dict.id < 30000) dict.type = "percussive"
                else dict.type = "scalable"
                delete dict.id
            }) 
            return map
        } catch(e){
            return null
        }
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
                this.soundNameMap = cacheToMap(cache)
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
            if (buffers.get(sound)){
                return resolve()
            } else {
                const map = this.getSoundNameMap()
                if(map && !map.get(sound)){
                    // sound is brought by user
                    return reject(`define instrument [ ${sound} ] with Ongaq.bringIn() first`)
                }
            }

            buffers.set(sound,[])
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
                    reject(`Cannot load sound resources. There are 3 possible reasons: 1) [ ${sound} ] is invalid as an instrumental name. 2) Your remote IP address or hostname is not registered as an authorized origin at dashboard. 3) [ ${this.api_key} ] is not a valid API key.`)
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
        else if (soundID < 60000) key = toPianoNoteName(key)
        else key = toPianoNoteName(key)

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
