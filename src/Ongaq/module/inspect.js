const inspect = (object, policy = {}, redo = true) => {
    let result
    switch (typeof object) {
        case "string":
            return typeof policy.string === "function" && policy.string(object)
        case "object":
            if (Array.isArray(object) && typeof policy.array === "function") return policy.array(object)
            return typeof policy.object === "function" && policy.object(object)
        case "number":
            return typeof policy.number === "function" ? policy.number(object) : object
        case "boolean":
            return object
        case "function":
            result = object(...policy._arguments)
            if (typeof policy._next === "function") result = policy._next(result)
            return redo ? inspect(result, policy, false) : result
        default:
            if (policy.default) {
                if (typeof policy.default === "function") return policy.default(policy._arguments)
                else return policy.default
            } else {
                return object
            }
    }

}

export default inspect