import Pool from "./Pool"
import SoundTree from "./SoundTree"

const pool = new Pool({
    makeMethod: SoundTree,
    washMethod: null,
    active: true,
    isClass: true,
    name: "SoundTree"
})

export default pool
