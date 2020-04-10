let pool = new Map()

const handler = {
    get: pool.get,
    set: pool.set,
    flush: ()=>{
        pool.forEach((node)=>{
            node.disconnect && node.disconnect()
            node = null
        })
        pool = new Map()
    }
}

export default handler