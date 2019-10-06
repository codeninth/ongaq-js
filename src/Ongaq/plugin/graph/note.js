import make from "../../module/make"
import PRIORITY from "../../plugin/graph/PRIORITY"
import inspect from "../../module/inspect"
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
    const key = inspect(o.key,{
        _arguments: [graph.beatIndex, graph.measure],
        string: v=>[v],
        object: v=> v.key,
        array: v=>v
    })
   
    if(!key || key.length === 0){
        graph._hasNote = false
        return false
    }
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
    if(!length){
        graph._hasNote = false
        return false
    }
    graph._hasNote = true
    
    /*
    必ず自身と同じ構造のオブジェクトを返す関数を返す
    =====================================================================
  */

    return E=>{
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
        
        E.terminal[0] = E.terminal[0] || []
        E.terminal[0].push(...newNodes)
        E.priority = MY_PRIORITY
        E.footprints = E.footprints || {}
        E.footprints._noteLength = length * graph._secondsPerBeat
        E.footprints._graphBeatTime = graph.beatTime
        return E

    }


}

export default plugin
