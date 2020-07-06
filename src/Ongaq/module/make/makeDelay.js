import DelayPool from "../pool.delay"
let pool = DelayPool.pool
let periods = DelayPool.periods

const RETRIEVE_INTERVAL = 4
const PADDING = 30

const makeDelay = ({ delayTime, end }, ctx )=>{

    if(periods[periods.length-1] < end){
        pool.push([])
        periods.push( end + RETRIEVE_INTERVAL )

    } else if (periods[0] + PADDING < end) {
        // to free old delayNodes
        pool[0].forEach((usedDelay,_) => {
            usedDelay && usedDelay.disconnect()
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
