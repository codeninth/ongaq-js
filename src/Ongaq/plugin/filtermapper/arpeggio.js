import AudioCore from "../../module/AudioCore"
import Helper from "../../module/Helper"
import make from "../../module/make"
import inspect from "../../module/inspect"
import isActive from "../../module/isActive"
import PRIORITY from "../../plugin/filtermapper/PRIORITY"
const MY_PRIORITY = PRIORITY.arpeggio
const context = AudioCore.context

const delayPool = new Map()
const functionPool = new Map()

const generate = (step, range, secondsPerBeat) => {

    return E => {

        if (
            E.terminal.length === 0 ||
            E.terminal[ E.terminal.length - 1 ].length === 0
        ) return E

        let newNodes = []
        for (let i = 0, max = E.terminal[ E.terminal.length - 1 ].length, delayTime; i < max; i++) {
            delayTime = secondsPerBeat * (i <= range ? i : range) * step
            if (!delayPool.get(delayTime)) {
                delayPool.set(delayTime, make("delay", { delayTime }))
            }
            newNodes.push(delayPool.get(delayTime))
        }

        let g = context.createGain()
        g.gain.setValueAtTime(1, 0)
        g.gain.setValueCurveAtTime(
            Helper.getWaveShapeArray(0),
            E.footprints._graphBeatTime + E.footprints._noteLength - 0.02, 0.02
        )
        newNodes.forEach(n=>{ n.connect(g) })

        E.terminal.push([g])
        E.terminal[ E.terminal.length - 2 ].forEach((pn, i) => {
            pn.connect( newNodes[ i <= newNodes.length - 1 ? i : newNodes.length - 1 ] )
        })
        newNodes = newNodes.slice(0, E.terminal[ E.terminal.length - 2 ].length)

        E.priority = MY_PRIORITY
        return E

    }

}

/*
  o: {
    step: 0.5 // relative beat length
  }
*/
const plugin = (o = {}, graph = {}) => {

    if (!isActive(o.active, graph)) return false

    const step = inspect(o.step, {
        number: v => v < 16 ? v : 1,
        _arguments: [graph.beatIndex, graph.measure, graph.attachment],
        default: 0
    }) 
    if (!step) return false
    const range = inspect(o.range, {
        number: v => (v > 0 && v < 9) ? v : 3,
        _arguments: [graph.beatIndex, graph.measure, graph.attachment],
        default: 3
    }) 

    const cacheKey = `${step}_${range}_${graph.secondsPerBeat}`
    if (functionPool.get(cacheKey)) return functionPool.get(cacheKey)
    else {
        functionPool.set(cacheKey, generate(step, range, graph.secondsPerBeat))
        return functionPool.get(cacheKey)
    }

}

export default plugin
