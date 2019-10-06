const inspect = ( object, policy = {}, redo = true )=>{
    let result
    switch(typeof object){
        case "string":
            return policy.string( object )
        case "object":
            if (Array.isArray(object)) return policy.array( object )
            else return policy.object( object )
        case "number":
            return policy.number( object )
        case "boolean":
            return policy.boolean( object )
        case "function":
            result = object( ...policy._arguments )
            return redo ? inspect( result, policy, false ) : result
        default:
            if(policy.default){
                if(typeof policy.default === "function") return policy.default( policy._arguments )
                else return policy.default
            } else {
                return object
            }
    }
}

export default inspect
