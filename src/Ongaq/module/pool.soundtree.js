import Pool from "./Pool"
import SoundTree from "./SoundTree"

const pool = new Pool({
    makeMethod: SoundTree,
    active: true,
    isClass: true,
    name: "SoundTree"
})

export default pool
