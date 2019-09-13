const drumPart = new Part({
    sound: "small_cube_drums",
    measure: 4
})
drumPart.add(
    new Filter({
        key: ["kick"],
        active: n => n % 8 === 0
    })
)
drumPart.add(
    new Filter({
        key: ["hihat"],
        active: n => n % 8 === 4
    })
)

const loop = new Loop({
    id: "my-first-loop",
    bpm: 110
})
loop.add(drumPart)

const ongaq = new Ongaq({
    api_key: "master_api_key_00",
    volume: 50
})

ongaq.import(loop).then(() => {
    console.log("ready to start.")
    const b = document.getElementById("button")
    b.onclick = () => {
        if(ongaq.params.isPlaying){
            ongaq.pause()
            b.className = "start"
        } else {
            ongaq.start()
            b.className = "pause"
        }
    }
})