/*
    replace "YOUR_API_KEY" below with yours
    ================
*/

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
  active: (n, m) => n === 0 && m === 1
}))

const ongaq = new Ongaq({
  api_key: "YOUR_API_KEY",
  bpm: 130,
  volume: 40,
  onReady: () => {
    const button = document.getElementById("button")
    button.className = "button start"
    button.onclick = () => {
      if (ongaq.params.isPlaying) {
        ongaq.pause()
        button.className = "button start"
      } else {
        ongaq.start()
        button.className = "button pause"
      }
    }
  }
})
ongaq.add(my_drums)
ongaq.add(my_guitar)
