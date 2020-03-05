import Helper from "../../module/Helper"
import make from "../../module/make"
import inspect from "../../module/inspect"
import isActive from "../../module/isActive"
import PRIORITY from "../../plugin/filtermapper/PRIORITY"
const MY_PRIORITY = PRIORITY.pan

const pannerPool = new Map()
const functionPool = new Map()

const generate = ( x, context )=>{

    return MappedFunction => {
        if (MappedFunction.terminal.length === 0) return MappedFunction
        if (!pannerPool.get(x)) pannerPool.set(x, make("panner", { x }, context))
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
const mapper = (o = {}, _targetBeat = {}, context )=>{

    if (!isActive(o.active, _targetBeat)) return false
    const x = inspect(o.x,{
        string: v => Helper.toInt(v, { max: 90, min: -90 }),
        number: v => Helper.toInt(v, { max: 90, min: -90 }),
        _arguments: [_targetBeat.beatIndex, _targetBeat.measure, _targetBeat.attachment],
        _next: v=>{
            return Helper.toInt(v, { max: 90, min: -90 })
        },
        default: 0
    })
    if(!x) return false

    if(!(context instanceof AudioContext)){
        if(functionPool.get(`offline_${x}`)) functionPool.set(`offline_${x}`,generate(x,context))
        return functionPool.get(`offline_${x}`)
    }

    if(functionPool.get(x)) return functionPool.get(x)
    else {
        functionPool.set( x, generate(x,context) )
        return functionPool.get(x)
    }

}

export default mapper
