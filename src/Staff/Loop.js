class Loop {

    constructor(data = {},option = {}){
        this.init(data,option)
    }

    init(data){
        this.bpm = data.bpm
        this.id = data.id
        this.tag = data.tag
        this._part = []
    }

    get part(){
        return this._part
    }

    /*
        @add
    */
    add(partToAdd){
        this._part.push(partToAdd)
        return this
    }

    /*
        @merge
        - add all parts of other loop
    */
    merge(anotherLoop){
        if(!anotherLoop || !Array.isArray(anotherLoop.part) || anotherLoop.part.length === 0) return false
        anotherLoop.part.forEach(p=>this.add(p))
        return this
    }

}

window.Loop = window.Loop || Loop

export default Loop
