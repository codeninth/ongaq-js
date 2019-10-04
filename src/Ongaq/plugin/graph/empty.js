const MY_PRIORITY = 10
const Element = ()=>{

  return PrevElement=>{
    return {
      priority: MY_PRIORITY,
      terminal: PrevElement.terminal || [],
      initizalize: ()=>{
        return PrevElement.initizalize()
      }
    }
  }

}

export default Element
