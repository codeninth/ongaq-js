import AudioCore from "./AudioCore"
const context = AudioCore.context
import Pool from "./Pool"

const pool = new Pool({
    makeMethod: (offlineContext)=>{
        return (offlineContext || context).createGain()
    },
    active: true,
    isClass: false,
    name: "GainNode"
})

export default pool
