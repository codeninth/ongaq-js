import Helper from "../../module/Helper"
import make from "../../module/make"
import PRIORITY from "../../plugin/graph/PRIORITY"
const MY_PRIORITY = PRIORITY.pan

/*
  o: {
    x: 90
  }
*/
const pannerPool = new Map()
const functionPool = new Map()

const generate = ( positionX )=>{

  return PrevElement => {

    if (!Array.isArray(PrevElement.terminal) || PrevElement.terminal.length === 0) return PrevElement
    let newNode
    if (pannerPool.get(positionX)) {
      newNode = pannerPool.get(positionX)
    } else {
      pannerPool.set(positionX, make("panner", { positionX }))
      newNode = pannerPool.get(positionX)
    }
    const terminal = [newNode.terminal]

    PrevElement.terminal.forEach(pn => {
      pn.connect(newNode.terminal)
    })
    return {
      priority: MY_PRIORITY,
      terminal: terminal,
      initizalize: () => {
        PrevElement.initizalize()
        newNode.initizalize()
      }
    }

  }

}


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
    
    if(functionPool.get(positionX)) return functionPool.get(positionX)
    else {
      functionPool.set( positionX, generate(positionX) )
      return functionPool.get(positionX)
    }

}

export default plugin
