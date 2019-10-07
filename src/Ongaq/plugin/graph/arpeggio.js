import AudioCore from "../../module/AudioCore"
import Helper from "../../module/Helper"
import make from "../../module/make"
import PRIORITY from "../../plugin/graph/PRIORITY"
const MY_PRIORITY = PRIORITY.arpeggio
const context = AudioCore.context

/*
  o: {
    step: 0.5 // relative length
    filter: n=>n%4
  }
*/
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

const plugin = (o = {}, graph = {}) => {

    const step = typeof o.step === "number" && o.step < 16 ? o.step : 1
    const range = typeof o.step === "number" && (o.range > 0 && o.range < 9) ? o.range : 3
    const cacheKey = `${step}_${range}_${graph._secondsPerBeat}`
    if (functionPool.get(cacheKey)) return functionPool.get(cacheKey)
    else {
        functionPool.set(cacheKey, generate(step, range, graph._secondsPerBeat))
        return functionPool.get(cacheKey)
    }

}

export default plugin
