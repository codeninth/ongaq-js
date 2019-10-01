class Filter {

    constructor(params){
        this.init(params)
    }

    init(params = { type: null }){
        this.type = typeof params.type === "string" ? params.type : "note"
        this.params = params
        delete params.type
    }

}

window.Filter = window.Filter || Filter

export default Filter
