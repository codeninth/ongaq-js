import inspect from "./inspect"

const isActive = (active,graph) => {
    return inspect(active, {
        _arguments: [graph.beatIndex, graph.measure, graph.attachment],
        object: v => Array.isArray(v) && v.includes(graph.beatIndex),
        number: v => v === graph.beatIndex,
        default: true
    })
}

export default isActive
