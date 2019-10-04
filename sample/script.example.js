const my_drums = new Part({
    sound: "small_cube_drums"
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

const my_guitar = new Part({
    sound: "nylon_guitar",
    measure: 4
})

my_guitar.add(new Filter({
    key: new Chord("CM9"),
    length: 16,
    active: (n,m)=> n === 0 && m === 1
}))

const ongaq = new Ongaq({
    api_key: "master_api_key_00",
    bpm: 130,
    volume: 40,
    onReady: ()=>{
        const button = document.getElementById("button")
        button.className = "start"
        button.onclick = () => {
            if (ongaq.params.isPlaying) {
                ongaq.pause()
                button.className = "start"
            } else {
                ongaq.start()
                button.className = "pause"
            }
        }
    }
})
ongaq.add(my_drums)
ongaq.add(my_guitar)

