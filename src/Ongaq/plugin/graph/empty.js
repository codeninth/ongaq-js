const MY_PRIORITY = 10
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
