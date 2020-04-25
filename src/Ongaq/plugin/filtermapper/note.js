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
const mapper = (o = {}, _targetBeat = {}, context) => {

    if (!isActive(o.active, _targetBeat)) return false

    /*
      key should be:
        - string like "C1"
        - array like ["C1","G1"]
        - Chord object
    */
    const key = inspect(o.key, {
        _arguments: [_targetBeat.beatIndex, _targetBeat.measure, _targetBeat.attachment],
        string: v => [v],
        object: v => v.key,
        array: v => v
    })
    if (!key || key.length === 0) return false

    /*
      calculate relative length of note
    */
    const length = inspect(o.length, {
        _arguments: [_targetBeat.beatIndex, _targetBeat.measure, _targetBeat.attachment],
        number: v => v,
        array: v => v,
        default: DEFAULT_NOTE_LENGTH
    })
    if (!length) return false

    const _volume_number = v=>{
      if(v > 0 && v < 100) return v / 100
      else if(v === 0) return -1
      else if(v === 100) return 0.999
      else return null
    }
    let volume = inspect(o.volume, {
            _arguments: [_targetBeat.beatIndex, _targetBeat.measure, _targetBeat.attachment],
            number: _volume_number,
            string: () => false,
            object: () => false,
            array: () => false
        })
    if(volume === -1) return false // to prevent noise when 0 assigned
        /*
              必ず自身と同じ構造のオブジェクトを返す関数を返す
              =====================================================================
            */

    return MappedFunction => {

        const newNodes = key.map((k, i) => {
            return make("audiobuffer", {
                buffer: {
                    sound: _targetBeat.sound,
                    length: (!Array.isArray(length) ? length : (typeof length[i] === "number" ? length[i] : DEFAULT_NOTE_LENGTH)) * _targetBeat.secondsPerBeat,
                    key: k,
                    startTime: _targetBeat.beatTime
                },
                volume
            }, context)
        })

        MappedFunction.terminal[0] = MappedFunction.terminal[0] || []
        MappedFunction.terminal[0].push(...newNodes)
        MappedFunction.priority = MY_PRIORITY
        MappedFunction.footprints = MappedFunction.footprints || {}
        MappedFunction.footprints._noteLength = (!Array.isArray(length) ? length : (typeof length[0] === "number" ? length[0] : DEFAULT_NOTE_LENGTH)) * _targetBeat.secondsPerBeat
        MappedFunction.footprints._beatTime = _targetBeat.beatTime
        return MappedFunction

    }


}

export default mapper