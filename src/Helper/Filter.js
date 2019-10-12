import PRIORITY from "../Ongaq/plugin/filtermapper/PRIORITY"

class Filter {

    constructor(params){
        this.init(params)
    }

    init(params = { type: null }){
        this.type = typeof params.type === "string" ? params.type : "note"
        this.params = params
        this.priority = PRIORITY[ this.type ] || -1
        delete params.type
    }

}

export default Filter
