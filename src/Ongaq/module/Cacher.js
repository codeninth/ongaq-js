const ss = window.sessionStorage
const _isAvailable = (() => {
    if (!ss) return false
    let _isAvailable = false
    try {
        ss.setItem("_test", "1")
        _isAvailable = true
    } catch (e) {
        return false
    } finally {
        if (_isAvailable) ss.removeItem("_test")
    }
    return _isAvailable
})()

export default {
    set: (key, value)=>{
        if (!_isAvailable || "string" !== typeof key) return false
        return ss.setItem(`cache.${key}`, value)
    },
    get: (key)=>{
        if (!_isAvailable || "string" !== typeof key) return false
        return ss.getItem(`cache.${key}`)
    },
    purge: (key)=>{
        if (!_isAvailable || "string" !== typeof key) return false
        return ss.removeItem(`cache.${key}`)
    }
}