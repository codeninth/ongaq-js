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
        if (PrevElement.terminal.length === 0) return PrevElement
        if (!pannerPool.get(positionX)) pannerPool.set(positionX, make("panner", { positionX }))
        const newNode = pannerPool.get(positionX)
        
        PrevElement.terminal.push([ newNode ])

        PrevElement.terminal[ PrevElement.terminal.length - 2 ].forEach(pn => {
            pn.connect(newNode)
        })
        PrevElement.priority = MY_PRIORITY
        return PrevElement

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
