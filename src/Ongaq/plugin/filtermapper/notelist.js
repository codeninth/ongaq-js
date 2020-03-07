import make from "../../module/make"
import PRIORITY from "../../plugin/filtermapper/PRIORITY"
import inspect from "../../module/inspect"
import isActive from "../../module/isActive"
const MY_PRIORITY = PRIORITY.note
const DEFAULT_NOTE_LENGTH = 4

/*
  o: {
    active: n=>n%4,
    notes: [
      { key: "C3", length: 4 },
      { key: "G3", length: 8 }
    ]
  }
*/
const mapper = (o = {}, _targetBeat = {}, context )=>{

    if(!isActive(o.active,_targetBeat)) return false
    let notes
    if(Array.isArray(o.notes)){
        notes = o.notes
    } else if(typeof o.notes === "function"){
        notes = o.notes(_targetBeat.beatIndex, _targetBeat.measure, _targetBeat.attachment)
    } else {
        return false
    }

    const data = notes.map(({ key, length, volume })=>{

        const _key = inspect(key, {
            _arguments: [_targetBeat.beatIndex, _targetBeat.measure, _targetBeat.attachment],
            string: v => [v],
            object: v => v.key,
            array: v => v
        })

        const _length = inspect(length, {
            _arguments: [_targetBeat.beatIndex, _targetBeat.measure, _targetBeat.attachment],
            number: v => v,
            default: DEFAULT_NOTE_LENGTH
        })

        let _volume = inspect(volume, {
            _arguments: [_targetBeat.beatIndex, _targetBeat.measure, _targetBeat.attachment],
            number: v => v,
            string: v=> false,
            object: v=> false,
            array: v=> false
        })
        _volume = _volume >= 0 && _volume <= 100 ? _volume / 100 : null
        

        if(!_key || key.length === 0 || !length) return false
        return {
            key: _key,
            length: _length,
            volume: _volume
        }

    }).filter(_=>_)

    if(!Array.isArray(data) || data.length === 0) return false

    return MappedFunction=>{

        const newNodes = data.map(({ key, length, volume })=>{
            return make("audiobuffer",{
                buffer: {
                    sound: _targetBeat.sound,
                    length: length * _targetBeat.secondsPerBeat,
                    key,
                    startTime: _targetBeat.beatTime
                },
                volume
            }, context)
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
