class Part {

    constructor(data = {}){
        this.init(data)
    }

    init(data){
        this.id = data.id
        this.sound = data.sound
        this.tag = data.tag
        this.measure = data.measure
        this.notesInMeasure = data.notesInMeasure
        this._filters = []
        this.mute = !!data.mute
    }

    get filters(){
        return this._filters
    }

    add(filters){
        if (!filters) return this
        this._filters.push(filters)
        return this
    }

}

window.Part = window.Part || Part

export default Part
