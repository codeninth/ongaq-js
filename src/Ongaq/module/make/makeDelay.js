import AudioCore from "../AudioCore"
import DelayPool from "../pool.delay"
let pool = DelayPool.pool

const RETRIEVE_INTERVAL = 4
const PADDING = 30
let periods = [1,2,3,4].map(n => n * RETRIEVE_INTERVAL + AudioCore.context.currentTime)

const makeDelay = ({ delayTime, end }, ctx )=>{

    if(periods[periods.length-1] < end){
        pool.push([])
        periods.push( end + RETRIEVE_INTERVAL )

    } else if (periods[0] + PADDING < end) {
        // to free old delayNodes
        pool[0].forEach((usedDelay,_) => {
            usedDelay.disconnect()
            pool[0][_] = null
        })
        periods = periods.slice(1)
        pool = pool.slice(1)
    }

    let d = ctx.createDelay()
    d.delayTime.value = delayTime
    for(let i = 0, l = periods.length, done = false; i<l; i++){
        if(periods[i] > end && !done){
            pool[i].push(d), done = true
        }
    }
    return d
}

export default makeDelay
