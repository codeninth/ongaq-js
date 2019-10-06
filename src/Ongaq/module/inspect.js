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
            return object
    }
}

export default inspect
