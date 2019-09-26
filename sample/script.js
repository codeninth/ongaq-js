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

const loop = new Loop({
    id: "my-first-loop",
    bpm: 110
})
loop.add(my_drums)
loop.add(my_guitar)

const ongaq = new Ongaq({
    api_key: "master_api_key_00",
    volume: 50
})

ongaq.add(loop).then(() => {
    console.log("ready to start.")
    const button = document.getElementById("button")
    button.onclick = () => {
        if(ongaq.params.isPlaying){
            ongaq.pause()
            button.className = "start"
        } else {
            ongaq.start()
            setTimeout(()=>{
              console.log("mute")
              console.log(loop)
              loop.mute = true
            },2000)
            button.className = "pause"
        }
    }
})
