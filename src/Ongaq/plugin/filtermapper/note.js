import make from "../../module/make"
import PRIORITY from "../../plugin/filtermapper/PRIORITY"
import inspect from "../../module/inspect"
import isActive from "../../module/isActive"
const MY_PRIORITY = PRIORITY.note
const DEFAULT_NOTE_LENGTH = 4

/*
  o: {
    key: ["C1","G1"],
    active: n=>n%4
  }
*/
const plugin = ( o = {}, beat = {} )=>{

    if(!isActive(o.active,beat)) return false

    /*
      key should be:
        - string like "C1"
        - array like ["C1","G1"]
        - Chord object
    */
    const key = inspect(o.key,{
        _arguments: [ beat.beatIndex, beat.measure, beat.attachment ],
        string: v=>[v],
        object: v=> v.key,
        array: v=>v
    })
    if(!key || key.length === 0){
        beat._hasNote = false
        return false
    }

    /*
      calculate relative length of note
    */
    const length = inspect(o.length,{
        _arguments: [ beat.beatIndex, beat.measure, beat.attachment ],
        number: v=>v,
        default: DEFAULT_NOTE_LENGTH
    })
    if(!length){
        beat._hasNote = false
        return false
    }
    beat._hasNote = true
    
    /*
      必ず自身と同じ構造のオブジェクトを返す関数を返す
      =====================================================================
    */

    return E=>{
        let newNodes = key.map(k=>{
            return make("audiobuffer",{
                buffer: {
                    sound: beat.sound,
                    length: length * beat.secondsPerBeat,
                    key: k,
                    startTime: beat.beatTime
                },
                volume: o.volume >= 0 && o.volume <= 100 ? o.volume / 100 : null
            })
        })
        
        E.terminal[0] = E.terminal[0] || []
        E.terminal[0].push(...newNodes)
        E.priority = MY_PRIORITY
        E.footprints = E.footprints || {}
        E.footprints._noteLength = length * beat.secondsPerBeat
        E.footprints._beatTime = beat.beatTime
        return E

    }


}

export default plugin
