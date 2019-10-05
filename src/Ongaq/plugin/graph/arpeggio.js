import make from "../../module/make"
import PRIORITY from "../../plugin/graph/PRIORITY"
const MY_PRIORITY = PRIORITY.arpeggio

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

        if (!Array.isArray(PrevElement.terminal) && PrevElement.terminal.length === 0) return PrevElement

        let newNodes = []
        for (let i = 0, max = PrevElement.terminal.length, delayTime; i < max; i++) {
            delayTime = secondsPerBeat * (i <= range ? i : range) * step
            if (!delayPool.get(delayTime)) {
                delayPool.set(delayTime, make("delay", { delayTime }))
            }
            newNodes.push(delayPool.get(delayTime))
        }

        let terminal = []
        PrevElement.terminal.forEach((pn, i) => {
            pn.connect(newNodes[i].terminal)
            terminal.push(newNodes[i].terminal)
        })
        newNodes = newNodes.slice(0, PrevElement.terminal.length)

        return {
            priority: MY_PRIORITY,
            terminal: terminal,
            initizalize: () => {
                PrevElement.initizalize()
                newNodes.forEach(n => n.initizalize())
            }
        }

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
