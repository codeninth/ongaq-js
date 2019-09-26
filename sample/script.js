const ongaq = new Ongaq({
    api_key: "master_api_key_00",
    volume: 50,
    bpm: 130
})
const drums = ongaq.createPart({
    sound: "small_cube_drums"
})

drums.add(
    new Filter({
        key: ["kick"],
        active: n => n % 8 === 0
    })
)
// drums.add(
//     new Filter({
//         key: ["hihat"],
//         active: n => n % 8 === 4
//     })
// )


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
