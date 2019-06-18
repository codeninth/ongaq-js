import AudioCore from "./AudioCore"

const Module = (()=>{

    let metrics = {
        required: 0,
        retrived: 0,
        recycled: 0
    }

    class Pool {

        constructor(o){

            this.x = AudioCore.getContext()

            this.name = o.name
            this.isClass = o.isClass
            this.active = o.active !== false

            this.makeMethod = o.makeMethod
            this.make = (option)=>{
                if(this.isClass) return new this.makeMethod(option)
                else return this.makeMethod(option)
            }

            this.washMethod = o.washMethod

            this.pool = []
            this.metrics = {
                required: 0,
                retrived: 0,
                recycled: 0
            }

        }

        allocate(option){

            let obj = undefined
            metrics.required++
            this.metrics.required++

            if(this.pool.length === 0 || this.active === false){
                obj = this.make(option)
            } else {
                obj = this.pool.pop()
                if(obj){
                    metrics.recycled++
                    this.metrics.recycled++
                } else {
                    obj = this.make(option)
                    if(obj && this.washMethod) obj = this.washMethod(obj,option)
                }
            }
            return obj
        }

        retrieve(obj){
            this.pool.push(obj)
            metrics.retrived++
            this.metrics.retrived++
        }

        flush(){
            this.pool = []
        }

    }

    return Pool

}).call(undefined,window)

export default Module
