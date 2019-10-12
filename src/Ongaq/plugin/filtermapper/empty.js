import pool from "../../module/pool.element"
import PRIORITY from "../../plugin/filtermapper/PRIORITY"
const MY_PRIORITY = PRIORITY.empty
const Element = ()=>{

    return ()=>{
        const elem = pool.allocate()
        elem.priority = MY_PRIORITY
        elem.terminal = []
        elem._inits = []
        elem.initialize = ()=>{
            elem._inits.forEach(i=>i())
        }
        return elem
    }

}

export default Element
