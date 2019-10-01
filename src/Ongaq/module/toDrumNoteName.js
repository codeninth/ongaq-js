import DRUM_NOTE from "../../Constants/DRUM_NOTE"

/*
    convert key name expression
    e.g.) "hihat" -> "1$5"
*/
export default (raw = "") => {
    return DRUM_NOTE.get(raw) || raw
}