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
                ongaq.record()
                button.className = "button pause"
            }
        }
    }
})
ongaq.add(my_drums)
