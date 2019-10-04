import * as plugin from "../plugin/graph/index"
/*
  「実際に audioContext が生成されたら
  どのようなオブジェクトを作成すればよいか」が分かるグラフ。

  「あるPartのある拍数でどんな音が再生されるべきか」を
  このグラフの階層を増やすことで表現する。
*/

class Graph {

    constructor(option) {
        this.sound = option.sound
        this.measure = option.measure
        this.beatIndex = option.beatIndex
        this.beatTime = option.beatTime
        this._secondsPerBeat = option._secondsPerBeat
        this.age = option.age
        this.prepared = false
        this.layer = []
    }

    arpeggio(o = {}) { return this.develop("arpeggio", o) }
    note(o = {}) { return this.develop("note", o) }
    pan(o = {}) { return this.develop("pan", o) }
    phrase(o = {}) { return this.develop("phrase", o) }

    pass(active) {
        switch (typeof active) {
        case "function": return active(this.beatIndex, this.measure)
        case "object": return Array.isArray(active) && active.includes(this.beatIndex)
        case "number": return active === this.beatIndex
        default: return true
        }
    }

    develop(method, o) {
        if (!this.pass(o.active)) return this
        const element = plugin[method](o, this)
        if(element) this.layer.push( element )
        return this
    }

    reduce(){
      if(this.layer.length === 0) return null
      this.layer.sort((a,b)=>{
        if(a.priority > b.priority) return 1
        else if(a.priority < b.priority) return -1
        else 0
      })
      return this.layer.reduce(( accumulator, currentValue )=>{
        return currentValue( accumulator() )
      }, plugin.empty() )
    }

}

export default Graph
