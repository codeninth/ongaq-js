const shiftKeys = (v,key)=>{

    if (v === 0 || v <= -13 || v >= 13) return key
    else if (!Array.isArray(key) ) return []
    
    let shifted = key.map(m => m.split("$").map(n => +n))

    shifted = shifted.map(pair => {
        if (pair[1] + v <= 12 && pair[1] + v > 0) return `${pair[0]}$${pair[1] + v}`
        else if (v < 0 && pair[1] + v <= 0) {
            /*
                - This note goes down to lower octave 
                - If octave 1, no more getting down -> skipped
                */
            if (pair[0] > 1) return `${ pair[0] - 1 }$${ 12 + pair[1] + v }`
            else return false
        }
        else if (v > 0 && pair[1] + v > 12) {
            /*
                - This note goes up to higher octave
                - If octave 4, no more getting up -> skipped
                */
            if (pair[0] < 4) return `${ pair[0] + 1 }$${ -12 + pair[1] + v }`
        } else {
            return false
        }

    }).filter(pair => pair)

    return shifted
}

export default shiftKeys