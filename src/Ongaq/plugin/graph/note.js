import make from "../../module/make"
import PRIORITY from "../../plugin/graph/PRIORITY"
const MY_PRIORITY = PRIORITY.note
const DEFAULT_NOTE_LENGTH = 4

/*
  o: {
    key: ["C1","G1"],
    active: n=>n%4
  }
*/
const plugin = ( o = {}, graph = {} )=>{

    /*
    key should be:
      - string like "C1"
      - array like ["C1","G1"]
      - Chord object
  */
    let key = ((key)=>{
        let _key

        switch(typeof key){

        case "string":
            return [key]

        case "function":
            _key = key( graph.beatIndex, graph.measure )
            if(_key){
                if(Array.isArray(_key)) return _key
                else if(typeof _key === "object") return Array.isArray(_key) ? _key : _key.key
                else if(typeof _key === "string") return [_key]
                else return false
            } else {
                return false
            }

        case "object":
            // supposed to be array or Chord object
            return Array.isArray(key) ? key : key.key

        default:
            return false
        }

    })(o.key)
    if(!key || key.length === 0) return false

    /*
      calculate relative length of note
  */
    let length = (()=>{
        if(!o.length) return DEFAULT_NOTE_LENGTH
        switch(typeof o.length){
        case "number":
            return o.length
        case "function":
            return o.length( graph.beatIndex, graph.measure )
        default:
            return false
        }
    })()
    if(!length) return false

    /*
    必ず自身と同じ構造のオブジェクトを返す関数を返す
    =====================================================================
  */

    return PrevElement=>{
        let newNodes = key.map(k=>{
            return make("audiobuffer",{
                buffer: {
                    sound: graph.sound,
                    length: length * graph._secondsPerBeat,
                    key: k,
                    startTime: graph.beatTime
                },
                volume: o.volume >= 0 && o.volume <= 100 ? o.volume / 100 : null
            })
        })
        
        PrevElement.terminal[0] = PrevElement.terminal[0] || []
        PrevElement.terminal[0].push(...newNodes)
        PrevElement.priority = MY_PRIORITY
        PrevElement._length = length * graph._secondsPerBeat
        PrevElement._startTime = graph.beatTime
        return PrevElement

    }


}

export default plugin
