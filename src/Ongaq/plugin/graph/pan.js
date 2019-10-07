import Helper from "../../module/Helper"
import make from "../../module/make"
import inspect from "../../module/inspect"
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

    const x = inspect(o.x,{
        // x の値は 仕様上角度を30で割った値を使う
        string: v => Helper.toInt(v, { max: 90, min: -90 }) / 30,
        number: v => Helper.toInt(v, { max: 90, min: -90 }) / 30,
        _arguments: [graph.beatIndex, graph.measure, graph.attachment],
        _next: v=>{
            return Helper.toInt(v, { max: 90, min: -90 }) / 30
        },
        default: 0
    })
    if(!x) return false
    
    if(functionPool.get(x)) return functionPool.get(x)
    else {
        functionPool.set( x, generate(x) )
        return functionPool.get(x)
    }

}

export default plugin
