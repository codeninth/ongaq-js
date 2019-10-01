import ROOT from "../../Constants/ROOT"

/*
    convert key name expression
    e.g.) "A1#" -> "1$11"
*/
const r = /^([A-Z])+([1-4])+(b|#)?$/

export default (raw = "") => {
    if (r.test(raw) === false) {
        return raw
    } else {
        const result = r.exec(raw)
        /*
            g1: C,D,E...A,B
            g2: 1,2,3,4
            g3: undefined, b, #
            */
        if (!result || !ROOT.get(result[1])) return raw
        return `${result[2]}$${ROOT.get(result[1] + (result[3] || ""))}`
    }
}