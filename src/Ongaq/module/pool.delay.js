import AudioCore from "./AudioCore"
const RETRIEVE_INTERVAL = 4

let pool = [ [], [], [], [] ]
let periods = [1, 2, 3, 4].map(n => n * RETRIEVE_INTERVAL + AudioCore.context.currentTime)
let recycleBox = []

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
    },
    retrieve: usedDelay => {
        if (usedDelay instanceof DelayNode === false) return false
        usedDelay.disconnect()
        recycleBox.push(usedDelay)
    },
    allocate: ({ delayTime, end },ctx)=>{
        let d
        if(recycleBox.length === 0){
            d = ctx.createDelay()
            for (let i = 0, l = periods.length, done = false; i < l; i++) {
                if (periods[i] > end && !done) {
                    pool[i].push(d), done = true
                }
            }
        } else {
            d = recycleBox.pop()
        }
        d.delayTime.value = delayTime
        return d
    }
}
