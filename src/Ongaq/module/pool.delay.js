let pool = [ [], [], [], [] ]

export default {
    pool,
    flush: ()=>{
        pool.forEach(list=>{
            list.forEach((usedDelay,_)=>{
                usedDelay.disconnect()
                list[_] = null
            })
        })
        pool = [ [], [], [], [] ]
    }
}
