//========================================
/*
  o: {
    step: 0.5 // relative length
    filter: n=>n%4
  }
*/
const plugin = (o = {},graph = {})=>{

    let newLayer = []

    let targetLayer = (()=>{
        if(graph.layer.length === 0) return false
        for(let i = graph.layer.length - 1,l = 0; i>=l; i--){
            if(graph.layer[i][0].invoker === "audioBufferLine") return graph.layer[i]
        }
        return false
    })()
    if(!targetLayer) return false
    let step = typeof o.step === "number" && o.step < 16 ? o.step : 1

    targetLayer.forEach((target,i)=>{
        newLayer.push({
            invoker: "delayLine",
            data: {
                delayTime: (graph._secondsPerBeat * (i <= 3 ? i : 3) * step),
                targetIndex: i
            }
        })
    })

    return newLayer

}

export default plugin
