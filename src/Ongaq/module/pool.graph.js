import Pool from "./Pool"
import Graph from "./Graph"

const pool = new Pool({
    makeMethod: Graph,
    washMethod: null,
    active: true,
    isClass: true,
    name: "Graph"
})

export default pool
