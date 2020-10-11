import Helper from "../../module/Helper"
import make from "../../module/make"
import inspect from "../../module/inspect"
import isActive from "../../module/isActive"
import DelayFunctionPool from "../../module/pool.delayfunction"
import PRIORITY from "../../plugin/filtermapper/PRIORITY"
const MY_PRIORITY = PRIORITY.arpeggio

const generate = (step, range, secondsPerBeat, ctx) => {

    return MappedFunction => {

        if (
            MappedFunction.terminal.length === 0 ||
            MappedFunction.terminal[ MappedFunction.terminal.length - 1 ].length === 0
        ) return MappedFunction

        let newNodes = []
        for (let i = 0, max = MappedFunction.terminal[MappedFunction.terminal.length - 1].length, delayTime, end = MappedFunction.footprints._beatTime + MappedFunction.footprints._noteLength; i < max; i++) {
            delayTime = secondsPerBeat * (i <= range ? i : range) * step
            if (ctx instanceof (window.AudioContext || window.webkitAudioContext)){
                newNodes.push(make("delay", { delayTime, end }, ctx))
            } else {
                newNodes.push(make("delay", { delayTime, end }, ctx))
            }
        }

        let g = ctx.createGain()
        g.gain.setValueAtTime(1, 0)
        g.gain.setValueCurveAtTime(
            Helper.getWaveShapeArray(0),
            MappedFunction.footprints._beatTime + MappedFunction.footprints._noteLength - 0.02, 0.02
        )
        newNodes.forEach(n=>{ n.connect(g) })

        MappedFunction.terminal.push([g])
        MappedFunction.terminal[ MappedFunction.terminal.length - 2 ].forEach((pn, i) => {
            pn.connect( newNodes[ i <= newNodes.length - 1 ? i : newNodes.length - 1 ] )
        })
        newNodes = newNodes.slice(0, MappedFunction.terminal[ MappedFunction.terminal.length - 2 ].length)

        MappedFunction.priority = MY_PRIORITY
        return MappedFunction

    }

}

/*
  o: {
    step: 0.5 // relative beat length
  }
*/
const mapper = (o = {}, _targetBeat = {}, ctx ) => {

    if (!isActive(o.active, _targetBeat)) return false

    const step = inspect(o.step, {
        number: v => v < 16 ? v : 1,
        _arguments: [_targetBeat.beatIndex, _targetBeat.measure, _targetBeat.attachment],
        default: 0
    })
    if (!step) return false
    const range = inspect(o.range, {
        number: v => (v > 0 && v < 9) ? v : 3,
        _arguments: [_targetBeat.beatIndex, _targetBeat.measure, _targetBeat.attachment],
        default: 3
    })

    const cacheKey = ctx instanceof (window.AudioContext || window.webkitAudioContext) ? `${step}_${range}_${_targetBeat.secondsPerBeat}` : `offline_${step}_${range}_${_targetBeat.secondsPerBeat}`
    if (DelayFunctionPool.get(cacheKey)) return DelayFunctionPool.get(cacheKey)
    else {
        DelayFunctionPool.set(cacheKey, generate(step, range, _targetBeat.secondsPerBeat, ctx))
        return DelayFunctionPool.get(cacheKey)
    }

}

export default mapper
