import AudioCore from "./AudioCore"

const VALUES = {
    BPM: 120,
    MIN_BPM: 60,
    MAX_BPM: 180,
    MEASURE: 4,
    VOLUME: 0.5,
    NOTE_VOLUME: 0.5,
    BEATS_IN_MEASURE: 16,
    PREFETCH_SECOND: AudioCore.powerMode === "middle" ? 0.3 : 2.0
}
export default VALUES
