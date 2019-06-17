import * as plugin from "../plugin/graph/index"
/*
  「実際に audioContext が生成されたら
  どのようなオブジェクトを作成すればよいか」が分かるグラフ。

  「あるPartのある拍数でどんな音が再生されるべきか」を
  このグラフの階層を増やすことで表現する。
*/

const Module = (()=>{

    class Graph {

        constructor(option){
            this.sound = option.sound
            this.noteIndex = option.noteIndex
            this.noteTime = option.noteTime
            this.secondsPerNote = option.secondsPerNote
            this.age = option.age
            this.layer = []
        }

        note(o = {}){ return this.develop("note",o) }
        pan(o = {}){ return this.develop("pan",o) }
        arpeggio(o = {}){ return this.develop("arpeggio",o) }
        empty(o = {}){ return this.develop("empty",o) }
        phrase(o = {}){ return this.develop("phrase",o) }

        pass(active){
            switch(typeof active){
            case "function": return active(this.noteIndex)
            case "object": return Array.isArray(active) && active.includes(this.noteIndex)
            case "number": return active === this.noteIndex
            default: return true
            }
        }

        develop(method,o){
            if(!this.pass(o.active)) return this
            let newLayer = plugin[method](o,this)
            if(newLayer) this.layer.push(newLayer)
            return this
        }

    }

    return Graph

}).call(undefined,window)

export default Module
