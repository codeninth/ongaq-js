import PRIORITY from "../../plugin/graph/PRIORITY"
const MY_PRIORITY = PRIORITY.empty
const Element = ()=>{

  return PrevElement=>{
    return {
      priority: MY_PRIORITY,
      terminal: PrevElement ? (PrevElement.terminal || []) : [],
      initizalize: ()=>{
        return PrevElement && PrevElement.initizalize()
      }
    }
  }

}

export default Element
