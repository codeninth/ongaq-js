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
        this.secondsPerBeat = option.secondsPerBeat
        this.age = option.age
        this.attachment = option.attachment || {}
        this.layer = []
    }

    arpeggio(o = {}) { return this._develop("arpeggio", o) }
    note(o = {}) { return this._develop("note", o) }
    pan(o = {}) { return this._develop("pan", o) }
    // phrase(o = {}) { return this._develop("phrase", o) }

    reduce() {
        if (this.layer.length === 0) return null
        this.layer.sort((a, b) => {
            if (a.priority > b.priority) return 1
            else if (a.priority < b.priority) return -1
            else 0
        })
        return this.layer.reduce((element, currentFunction) => {
            return currentFunction(element)
        }, plugin.empty()())
    }

    _pass(active) {
        switch (typeof active) {
        case "function": return active(this.beatIndex, this.measure, this.attachment)
        case "object": return Array.isArray(active) && active.includes(this.beatIndex)
        case "number": return active === this.beatIndex
        default: return true
        }
    }

    _develop(method, o) {
        if (!this._pass(o.active)) return this
        const elementFunction = plugin[method](o, this)
        if(elementFunction) this.layer.push( elementFunction )
        return this
    }

}

export default Graph
