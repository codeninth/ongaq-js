import Helper from "../../module/Helper"
import empty from "./empty"
import make from "../../module/make"
const MY_PRIORITY = 340

/*
  o: {
    x: 90
  }
*/
const plugin = ( o = {}, graph = {} )=>{

    const positionX = ((x)=>{
        switch(typeof x){
        // positionX の値は 仕様上角度を30で割った値を使う
        case "string":
        case "number":
            return Helper.toInt(x,{ max: 90, min: -90 }) / 30
        case "function":
            return Helper.toInt( x(graph.beatIndex), { max: 90, min: -90 } ) / 30
        default:
            return 0
        }
    })(o.x)
    if(positionX === 0) return false

    return PrevElement=>{

      if(!Array.isArray(PrevElement.terminal) && PrevElement.terminal.length === 0) return empty()

      const newNodes = [ make("panner",{ positionX }) ]
      const terminal = [ newNodes[0].terminal ]
      PrevElement.terminal.forEach((pn,i)=>{
        pn.terminal.connect( newNodes[0].terminal )
      })

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
