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
const mapper = (o = {}, _targetBeat = {}, offlineContext )=>{

    if(!isActive(o.active,_targetBeat)) return false

    /*
      key should be:
        - string like "C1"
        - array like ["C1","G1"]
        - Chord object
    */
    const key = inspect(o.key,{
        _arguments: [ _targetBeat.beatIndex, _targetBeat.measure, _targetBeat.attachment ],
        string: v=>[v],
        object: v=> v.key,
        array: v=>v
    })
    if(!key || key.length === 0){
        _targetBeat._hasNote = false
        return false
    }

    /*
      calculate relative length of note
    */
    const length = inspect(o.length,{
        _arguments: [ _targetBeat.beatIndex, _targetBeat.measure, _targetBeat.attachment ],
        number: v=>v,
        default: DEFAULT_NOTE_LENGTH
    })
    if(!length){
        _targetBeat._hasNote = false
        return false
    }
    _targetBeat._hasNote = true
    
    /*
      必ず自身と同じ構造のオブジェクトを返す関数を返す
      =====================================================================
    */

    return MappedFunction=>{
        let newNodes = key.map(k=>{
            return make("audiobuffer",{
                buffer: {
                    sound: _targetBeat.sound,
                    length: length * _targetBeat.secondsPerBeat,
                    key: k,
                    startTime: _targetBeat.beatTime
                },
                volume: o.volume >= 0 && o.volume <= 100 ? o.volume / 100 : null
            }, offlineContext)
        })
        
        MappedFunction.terminal[0] = MappedFunction.terminal[0] || []
        MappedFunction.terminal[0].push(...newNodes)
        MappedFunction.priority = MY_PRIORITY
        MappedFunction.footprints = MappedFunction.footprints || {}
        MappedFunction.footprints._noteLength = length * _targetBeat.secondsPerBeat
        MappedFunction.footprints._beatTime = _targetBeat.beatTime
        return MappedFunction

    }


}

export default mapper
