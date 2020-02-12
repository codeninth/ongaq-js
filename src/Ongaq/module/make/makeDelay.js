const makeDelay = ({ delayTime }, ctx )=>{
    let d = ctx.createDelay()
    d.delayTime.value = delayTime
    return d
}

export default makeDelay
