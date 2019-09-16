import AudioCore from "../module/AudioCore"

const context = AudioCore.context

class SoundLine {

    constructor(o = {}){
        this.init(o)
    }

    init(o){

        this.audioBufferNode = o.audioBufferNode instanceof AudioNode && o.audioBufferNode
        this.gainNode = o.gainNode instanceof GainNode ? o.gainNode : ((g)=>{
            g.gain.setValueAtTime(1,0)
            return g
        })( context.createGain() )
        this.output = o.output || this.gainNode
        this.name = o.name
        this.loader = typeof o.loader === "function" ? o.loader : null
        this.starter = typeof o.starter === "function" ? o.starter : null

    }

}

export default SoundLine
