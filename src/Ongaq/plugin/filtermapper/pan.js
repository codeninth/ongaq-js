import Helper from "../../module/Helper"
import make from "../../module/make"
import inspect from "../../module/inspect"
import isActive from "../../module/isActive"
import PRIORITY from "../../plugin/filtermapper/PRIORITY"
const MY_PRIORITY = PRIORITY.pan

const pannerPool = new Map()
const functionPool = new Map()

const generate = ( x )=>{

    return MappedFunction => {
        if (MappedFunction.terminal.length === 0) return MappedFunction
        if (!pannerPool.get(x)) pannerPool.set(x, make("panner", { x }))
        const newNode = pannerPool.get(x)
        
        MappedFunction.terminal.push([ newNode ])

        MappedFunction.terminal[ MappedFunction.terminal.length - 2 ].forEach(pn => {
            pn.connect(newNode)
        })
        MappedFunction.priority = MY_PRIORITY
        return MappedFunction
    }

}

/*
  o: {
    x: 90
  }
*/
const plugin = ( o = {}, beat = {} )=>{

    if (!isActive(o.active, beat)) return false
    const x = inspect(o.x,{
        // x の値は 仕様上角度を30で割った値を使う
        string: v => Helper.toInt(v, { max: 90, min: -90 }) / 30,
        number: v => Helper.toInt(v, { max: 90, min: -90 }) / 30,
        _arguments: [beat.beatIndex, beat.measure, beat.attachment],
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
