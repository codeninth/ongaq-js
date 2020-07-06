import DelayPool from "../pool.delay"
let pool = DelayPool.pool
let periods = DelayPool.periods

const RETRIEVE_INTERVAL = 4
const PADDING = 24

const makeDelay = ({ delayTime, end }, ctx )=>{

    if(periods[periods.length-1] < end){
        pool.push([])
        periods.push( end + RETRIEVE_INTERVAL )
    } else if (periods[0] + PADDING < end) {
        // to free old delayNodes
        pool[0] && pool[0].forEach((usedDelay) => {
            DelayPool.retrieve(usedDelay)
        })
        periods = periods.slice(1)
        pool = pool.slice(1)
    }
    return DelayPool.allocate({ delayTime, end },ctx)
}

export default makeDelay
