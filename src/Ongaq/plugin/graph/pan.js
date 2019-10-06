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

const generate = ( x )=>{

    return E => {
        if (E.terminal.length === 0) return E
        if (!pannerPool.get(x)) pannerPool.set(x, make("panner", { x }))
        const newNode = pannerPool.get(x)
        
        E.terminal.push([ newNode ])

        E.terminal[ E.terminal.length - 2 ].forEach(pn => {
            pn.connect(newNode)
        })
        E.priority = MY_PRIORITY
        return E

    }

}


const plugin = ( o = {}, graph = {} )=>{

    const x = ((x)=>{
        switch(typeof x){
        // x の値は 仕様上角度を30で割った値を使う
        case "string":
        case "number":
            return Helper.toInt(x,{ max: 90, min: -90 }) / 30
        case "function":
            return Helper.toInt( x(graph.beatIndex), { max: 90, min: -90 } ) / 30
        default:
            return 0
        }
    })(o.x)
    if(x === 0) return false
    
    if(functionPool.get(x)) return functionPool.get(x)
    else {
        functionPool.set( x, generate(x) )
        return functionPool.get(x)
    }

}

export default plugin
