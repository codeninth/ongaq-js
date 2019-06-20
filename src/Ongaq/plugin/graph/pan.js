import Helper from "../../module/Helper"

//========================================
/*
  o: {
    x: 90
  }
*/
const plugin = (()=>{

    return (o = {},graph = {})=>{

        let newLayer = []

        let targetLayer = (()=>{
            if(graph.layer.length === 0) return false
            for(let i = graph.layer.length - 1,l = 0; i>=l; i--){
                if(graph.layer[i][0].invoker === "audioBufferLine") return graph.layer[i]
            }
            return false
        })()
        if(!targetLayer) return false

        let positionX = ((x)=>{
            switch(typeof x){
            // positionX の値は 仕様上角度を30で割った値を使う
            case "string":
            case "number":
                return Helper.toInt(x,{ max: 90, min: -90 }) / 30
            case "function":
                return Helper.toInt( x(graph.noteIndex), { max: 90, min: -90 } ) / 30
            default:
                return 0
            }
        })(o.x)
        if(positionX === 0) return false
        targetLayer.forEach((target,i)=>{
            newLayer.push({
                invoker: "pannerLine",
                data: {
                    positionX: positionX,
                    targetIndex: i
                }
            })
        })
        return newLayer

    }

}).call(undefined,window || {})

export default plugin
