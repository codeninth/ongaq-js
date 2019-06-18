import AudioCore from "./AudioCore"
import ROOT from "../../Constants/ROOT"
import DRUM_NOTE from "../../Constants/DRUM_NOTE"
import SOUND_NAME from "../../Constants/SOUND_NAME"
import ENDPOINT from "../../Constants/ENDPOINT"
import request from "superagent"
import nocache from "superagent-no-cache"

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

        set({ api_key, offline, resourcesPath }){
            this.api_key = api_key
            this.offline = !!offline
            this.resourcesPath = resourcesPath || "/"
        }

        get endpoint(){
            if (this.offline === false) return `${ENDPOINT}/${this.resourcesPath}`
            else return `${this.resourcesPath}`
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

                return new Promise((_resolve, _reject) => {

                    let thisRequest
                    if(this.offline === false){
                        thisRequest = request
                            .get(this.endpoint)
                            .query({
                                sound: sound,
                                api_key: this.api_key
                            })
                    } else {
                        thisRequest = request
                            .get(`${this.endpoint}${SOUND_NAME.get(sound)}.json`)
                    }

                    thisRequest
                        .set("Content-Type", "application/json")
                        .use(nocache)
                        .then(res => {
                            let result, data
                            if(this.offline === false){
                                result = res.body.sounds[0]
                                if (!result || result.status !== "OK") return _reject()
                                data = result.data
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
                                    length: thisNote.length,
                                    resolve: audioBuffer => {
                                        thisSoundBuffers.set(key, audioBuffer)
                                        if (++decodedBufferLength === notes.length) {
                                            notes = null
                                            buffers.set(sound, thisSoundBuffers)
                                            _resolve()
                                        }

                                    },
                                    reject: () => {
                                        soundsToLoad.forEach(sound => {
                                            if (buffers.has(sound)) buffers.delete(sound)
                                        })
                                        _reject()
                                    }

                                })

                            })


                        })
                        .catch(() => {
                            soundsToLoad.forEach(sound => buffers.delete(sound))
                            _reject(`Cannot load sound resources. There are 2 possible reasons: 1) Some of [ ${soundsToLoad.join(",")} ] is invalid sound name. 2) [ ${this.api_key} ] is not a valid API key.`)
                        })

                })


            })

            return Promise.all(promises)


        }

        ship({ sound, key }){
            if(!sound || !key || !buffers.get(sound)) return false

            /*
                "1$Ab","hihat"
                などの読みやすい記法が使われている場合、ここでファイル名に変換する
            */
            const soundID = SOUND_NAME.get(sound)
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
