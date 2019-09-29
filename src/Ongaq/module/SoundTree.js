import AudioCore from "./AudioCore"
import * as invoker from "./invoker/invoker"
const context = AudioCore.context

class SoundTree {

    constructor(graph){
        this.init(graph)
    }

    init(graph){
        this.graph = graph
        this.output = context.createGain()
        this._secondsPerBeat = graph._secondsPerBeat
        this.layer = this.invokeAll()
    }

    invokeAll(){

        if(!Array.isArray(this.graph.layer)) return false

        let layer = new Array(this.graph.layer.length)

        this.graph.layer.forEach((thisMap,i)=>{

            let soundLines = thisMap.map(d=>{
                return d.invoker in invoker && invoker[d.invoker](d.data, i>0 && layer[i-1])
            }).filter(i=>i)

            if(soundLines.length > 0){
                layer[i] = {
                    name: soundLines[0].name,
                    loader: (totalLayer,totalLayerIndex)=>{
                        soundLines.forEach( line => line.loader && line.loader(totalLayer,totalLayerIndex) )
                    },
                    starter: ()=>{
                        soundLines.forEach( line => line.starter && line.starter() )
                    },
                    output: context.createGain(),
                    instance: soundLines
                }
            }
        })
        layer = layer.filter(n=>n)
        for(let i = 0,l = layer.length; i<l; i++){
            layer[i].loader(layer,i)
            // connect output of layers to that of SoundTree
            if(layer[i].name === "audioBufferLine") layer[i].output.connect(this.output)
        }

        return layer

    }

    connect(nextNode){
        this.output && this.output.connect(nextNode)
        return this
    }

    start(){
        if(!this.startAble) return false
        this.layer.forEach(l=>l.starter())
        return this
    }

    get startAble(){ return this.layer && this.layer[0] && typeof this.layer[0].loader === "function" }

}

export default SoundTree
