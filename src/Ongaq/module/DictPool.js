class DictPool {

    constructor() {
        this.pool = new Map()
    }

    get(key){
        return this.pool.get(key)
    }

    set(key,value){
        return this.pool.set(key,value)
    }

    flush() {
        this.pool.forEach((_) => {
            _.disconnect && _.disconnect()
            _ = null
        })
        this.pool = new Map()
    }

}

export default DictPool
