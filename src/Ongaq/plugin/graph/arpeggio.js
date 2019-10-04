import make from "../../module/make"
import PRIORITY from "../../plugin/graph/PRIORITY"
const MY_PRIORITY = PRIORITY.arpeggio

/*
  o: {
    step: 0.5 // relative length
    filter: n=>n%4
  }
*/
const plugin = (o = {},graph = {})=>{

    const step = typeof o.step === "number" && o.step < 16 ? o.step : 1
    const range = typeof o.step === "number" && (o.range > 0 && o.range < 9) ? o.range : 3

    return PrevElement=>{

      if (!Array.isArray(PrevElement.terminal) && PrevElement.terminal.length === 0) return PrevElement

      let newNodes = []
      for(let i = 0, max = PrevElement.terminal.length, delayTime; i<max; i++){
        delayTime = graph._secondsPerBeat * (i <= range ? i : range) * step
        newNodes.push( make("delay",{ delayTime }) )
      }

      let terminal = []
      PrevElement.terminal.forEach((pn,i)=>{
        pn.connect( newNodes[i].terminal )
        terminal.push( newNodes[i].terminal )
      })
      newNodes = newNodes.slice( 0, PrevElement.terminal.length )

      return {
        priority: MY_PRIORITY,
        terminal: terminal,
        initizalize: ()=>{
          PrevElement.initizalize()
          newNodes.forEach(n=>n.initizalize())
        }
      }

    }

}

export default plugin
