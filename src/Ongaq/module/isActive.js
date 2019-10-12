import inspect from "./inspect"

const isActive = (active,beat) => {
    return inspect(active, {
        _arguments: [beat.beatIndex, beat.measure, beat.attachment],
        object: v => Array.isArray(v) && v.includes(beat.beatIndex),
        number: v => v === beat.beatIndex,
        default: true
    })
}

export default isActive
