import Pool from "./Pool"

const pool = new Pool({
    makeMethod: ()=>{
        return {}
    },
    active: true,
    isClass: false,
    name: "Element"
})

export default pool
