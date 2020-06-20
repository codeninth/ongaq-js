/* Define the drums */
const drums = new Part({
  sound: 'my_band_drums',
});

// Kicks
drums.add(
  new Filter({
    key: 'kick',
    active: (n) => n === 0,
  })
);
drums.add(
  new Filter({
    key: 'kick2',
    active: (n) => n === 0,
  })
);

// Snare
drums.add(
  new Filter({
    key: 'snare',
    active: (n) => n === 8,
  })
);
drums.add(
  new Filter({
    key: 'snare2',
    active: (n) => n === 8,
  })
);

/* Define the chords */
const piano = new Part({
  sound: 'my_piano',
  measure: 10,
});

// Putih bersi...
piano.add(
  new Filter({
    key: new Chord('D#'),
    length: 16,
    active: (beat, measure) => beat === 0 && measure === 0,
  })
);
// iiih berseri...
piano.add(
  new Filter({
    key: new Chord('A#'),
    length: 16,
    active: (beat, measure) => beat === 0 && measure === 1,
  })
);
// iii... a...
piano.add(
  new Filter({
    key: new Chord('G#'),
    length: 16,
    active: (beat, measure) => beat === 0 && measure === 2,
  })
);
// roooma yang memi...
piano.add(
  new Filter({
    key: new Chord('A#'),
    length: 16,
    active: (beat, measure) => beat === 0 && measure === 3,
  })
);
// kat. Bahan yang...
piano.add(
  new Filter({
    key: new Chord('D#'),
    length: 16,
    active: (beat, measure) => beat === 0 && measure === 4,
  })
);
// see...
piano.add(
  new Filter({
    key: new Chord('Dm'),
    length: 16,
    active: (beat, measure) => beat === 0 && measure === 5,
  })
);
// eeerbaguna...
piano.add(
  new Filter({
    key: new Chord('G'),
    length: 16,
    active: (beat, measure) => beat === 8 && measure === 5,
  })
);
// aaaaa....
piano.add(
  new Filter({
    key: new Chord('Cm'),
    length: 16,
    active: (beat, measure) => beat === 0 && measure === 6,
  })
);
// ....tepung
piano.add(
  new Filter({
    key: new Chord('G#'),
    length: 16,
    active: (beat, measure) => beat === 0 && measure === 7,
  })
);
// beras
piano.add(
  new Filter({
    key: new Chord('A#'),
    length: 16,
    active: (beat, measure) => beat === 8 && measure === 7,
  })
);
// rose brand~
piano.add(
  new Filter({
    key: new Chord('D#'),
    length: 16,
    active: (beat, measure) => beat === 0 && measure === 8,
  })
);

/* Bassline */
const bass = new Part({
  sound: 'mono_bass',
  measure: 10,
});

// Putih bersi...
bass.add(
  new Filter({
    key: (beat, measure) => {
      return ['D2#'];
    },
    length: 16,
    active: (beat, measure) => beat === 0 && measure === 0,
  })
);
// iiih berseri...
bass.add(
  new Filter({
    key: (beat, measure) => {
      return ['A2#'];
    },
    length: 16,
    active: (beat, measure) => beat === 0 && measure === 1,
  })
);
// iii... a...
bass.add(
  new Filter({
    key: (beat, measure) => {
      return ['G2#'];
    },
    length: 16,
    active: (beat, measure) => beat === 0 && measure === 2,
  })
);
// roooma yang memi...
bass.add(
  new Filter({
    key: (beat, measure) => {
      return ['A2#'];
    },
    length: 16,
    active: (beat, measure) => beat === 0 && measure === 3,
  })
);
// kat. Bahan yang...
bass.add(
  new Filter({
    key: (beat, measure) => {
      return ['D2#'];
    },
    length: 16,
    active: (beat, measure) => beat === 0 && measure === 4,
  })
);
// see...
bass.add(
  new Filter({
    key: (beat, measure) => {
      return ['D2'];
    },
    length: 16,
    active: (beat, measure) => beat === 0 && measure === 5,
  })
);
// eeerbaguna...
bass.add(
  new Filter({
    key: (beat, measure) => {
      return ['G2'];
    },
    length: 16,
    active: (beat, measure) => beat === 8 && measure === 5,
  })
);
// aaaaa....
bass.add(
  new Filter({
    key: (beat, measure) => {
      return ['C2'];
    },
    length: 16,
    active: (beat, measure) => beat === 0 && measure === 6,
  })
);
// ....tepung
bass.add(
  new Filter({
    key: (beat, measure) => {
      return ['G2#'];
    },
    length: 16,
    active: (beat, measure) => beat === 0 && measure === 7,
  })
);
// beras
bass.add(
  new Filter({
    key: (beat, measure) => {
      return ['A2#'];
    },
    length: 16,
    active: (beat, measure) => beat === 8 && measure === 7,
  })
);
// rose brand~
bass.add(
  new Filter({
    key: (beat, measure) => {
      return ['D2#'];
    },
    length: 16,
    active: (beat, measure) => beat === 0 && measure === 8,
  })
);

// Build the song
const ongaq = new Ongaq({
  api_key: '0cc2c54894bd42d685963652eb238c11',
  volume: 100,
  bpm: 60,
  onReady: () => {
    const button = document.getElementById('button');
    button.className = 'button start';

    button.onclick = () => {
      if (ongaq.params.isPlaying) {
        ongaq.pause();
        button.className = 'button start';
      } else {
        ongaq.start();
        button.className = 'button pause';
      }
    };
  },
});

ongaq.add(drums);
ongaq.add(piano);
ongaq.add(bass);
