import Ongaq from "../src/api"
import cases from "./cases"

cases.forEach((c,index)=>{
  describe("chord",()=> {
    it(c.label || index,()=> {
      const result = c.function()
      if(!result) console.error(c)
      expect(result).toBe(true) 
    })
  })
})