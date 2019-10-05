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

    return PrevElement => {

        if (
            PrevElement.terminal.length === 0 ||
            PrevElement.terminal[ PrevElement.terminal.length - 1 ].length === 0
        ) return PrevElement

        let newNodes = []
        for (let i = 0, max = PrevElement.terminal[ PrevElement.terminal.length - 1 ].length, delayTime; i < max; i++) {
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
            PrevElement._startTime + PrevElement._length - 0.02, 0.02
        )
        newNodes.forEach(n=>{ n.connect(g) })

        PrevElement.terminal.push([g])
        PrevElement.terminal[ PrevElement.terminal.length - 2 ].forEach((pn, i) => {
            pn.connect( newNodes[ i <= newNodes.length - 1 ? i : newNodes.length - 1 ] )
        })
        newNodes = newNodes.slice(0, PrevElement.terminal[ PrevElement.terminal.length - 2 ].length)

        PrevElement.priority = MY_PRIORITY
        return PrevElement

    }

}

const plugin = (o = {}, graph = {}) => {

    const step = typeof o.step === "number" && o.step < 16 ? o.step : 1
    const range = typeof o.step === "number" && (o.range > 0 && o.range < 9) ? o.range : 3

    if (functionPool.get(`${step}_${range}_${graph._secondsPerBeat}`)) return functionPool.get(`${step}_${range}_${graph._secondsPerBeat}`)
    else {
        functionPool.set(`${step}_${range}_${graph._secondsPerBeat}`, generate(step, range, graph._secondsPerBeat))
        return functionPool.get(`${step}_${range}_${graph._secondsPerBeat}`)
    }

}

export default plugin
