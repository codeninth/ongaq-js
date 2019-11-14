const inspect = ( object, policy = {}, redo = true )=>{
    let result
    switch(typeof object){
    case "string":
        return policy.string( object )
    case "object":
        if (Array.isArray(object) && policy.array) return policy.array( object )
        else return policy.object(object)
    case "number":
        return policy.number( object )
    case "boolean":
        return object
    case "function":
        result = object( ...policy._arguments )
        if(typeof policy._next === "function") result = policy._next(result)
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
