const bass_drum = new Part({
    sound: "small_cube"
})
bass_drum.add("note", {
    key: ["kick"],
    active: noteIndex => noteIndex % 8 === 0
})
const loop = new Loop({
    id: "my-first-loop",
    bpm: 120
})
loop.add(bass_drum)

const ongaq = new Ongaq({
    apiKey: "YOUR_apiKey"
})
ongaq.import(loop)
.then((l) => {
    console.log(l)
    // ongaq.play()
})