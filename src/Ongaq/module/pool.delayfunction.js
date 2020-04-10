let pool = new Map()

const handler = {
    get: (key)=>{
        pool.get(key)
    },
    set: (key,value)=>{
        pool.set(key,value)
    },
    flush: ()=>{
        pool.forEach((f)=>{
            f = null
        })
        pool = new Map()
    }
}

export default handler