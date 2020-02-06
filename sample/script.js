const my_drums = new Part({
    sound: "small_cube_drums",
    measure: 4,
    maxLap: 3,
    repeat: false
})
my_drums.add(
    new Filter({
        key: ["kick"],
        active: n => n % 8 === 0
    })
)
my_drums.add(
    new Filter({
        key: ["hihat"],
        active: n => n % 8 === 4
    })
)
my_drums.add(
    new Filter({
      type: "pan",
      x: n => n % 16 === 4 ? -30 : 40
    })
)

const my_piano = new Part({
    sound: "my_piano",
    measure: 4,
    maxLap: 3,
    repeat: false
})
my_piano.add(
    new Filter({
        key: new Chord("Cm9"),
        active: 0,
        length: 8
    })
)
my_piano.add(
    new Filter({
        type: "arpeggio",
        step: 1
    })
)

const ongaq = new Ongaq({
    api_key: "master_api_key_00",
    bpm: 130,
    volume: 80,
    onReady: ()=>{
        const button = document.getElementById("button")
        button.className = "button start"
        button.onclick = () => {
            if (ongaq.params.isPlaying) {
                ongaq.pause()
                button.className = "button start"
            } else {
                ongaq.start()
                // ongaq.record({ maxLap: 1})
                button.className = "button pause"
            }
        }
    }
})
ongaq.add(my_drums)
ongaq.add(my_piano)
