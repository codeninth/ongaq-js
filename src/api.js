import Ongaq from "./Ongaq/Ongaq"
import Chord from "./Helper/Chord"
import Part from "./Ongaq/module/Part"
import Filter from "./Helper/Filter"

window.Ongaq = window.Ongaq || Ongaq
window.Chord = window.Chord || Chord
window.Part = window.Part || Part
window.Filter = window.Filter || Filter

export default {
    Ongaq,
    Chord,
    Part, //  to export to global scope
    Filter // to export to global scope
}
