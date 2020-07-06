import AudioCore from "./AudioCore"
const RETRIEVE_INTERVAL = 4

let pool = [ [], [], [], [] ]
let periods = [1, 2, 3, 4].map(n => n * RETRIEVE_INTERVAL + AudioCore.context.currentTime)

export default {
    pool,
    periods,
    flush: ()=>{
        pool.forEach(list=>{
            list.forEach((usedDelay,_)=>{
                usedDelay && usedDelay.disconnect()
                list[_] = null
            })
        })
        pool = [ [], [], [], [] ]
        periods = [1, 2, 3, 4].map(n => n * RETRIEVE_INTERVAL + AudioCore.context.currentTime)
    }
}
