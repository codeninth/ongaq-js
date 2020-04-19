class Pool {

    constructor(o) {

        this.name = o.name
        this.isClass = o.isClass
        this.active = o.active !== false

        this.makeMethod = o.makeMethod
        this.make = (option) => {
            if (this.isClass) return new this.makeMethod(option)
            else return this.makeMethod(option)
        }
        this.pool = []

    }

    allocate(option) {

        let obj = undefined
        if (this.pool.length === 0 || this.active === false) {
            obj = this.make(option)
        } else {
            obj = this.pool.pop()
            if (!obj) obj = this.make(option)
        }
        return obj
    }

    retrieve(obj) {
        this.pool.push(obj)
    }

    flush() {
        this.pool = []
    }

}

export default Pool
