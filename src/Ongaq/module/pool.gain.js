import Pool from "./Pool"

const pool = new Pool({
    makeMethod: context => context.createGain(),
    active: true,
    isClass: false,
    name: "GainNode"
})

export default pool
