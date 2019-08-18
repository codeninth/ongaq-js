const SOUND_NAME = new Map([

  /*
    110**
    - piano, keyboard, organ
  */
  ["my_piano", { id: 11001, tag:["piano"], free: true } ],
  ["blight_piano", { id: 11002, tag: ["piano"], free: false } ],
  ["plain_keyboard", { id: 11003, tag:["keyboard"], free: true } ],
  ["sweet_keyboard", { id: 11004, tag:["keyboard"], free: false } ],
  ["aged_keyboard", { id: 11005, tag:["keyboard"], free: false } ],
  ["glass_piano", { id: 11006, tag:["piano"], free: false } ],
  ["church_organ", { id: 11007, tag:["keyboard"], free: false } ],
  ["clavi_keyboard", { id: 11008, tag:["keyboard"], free: false } ],
  ["calm_keyboard", { id: 11009, tag:["keyboard"], free: false } ],
  ["school_organ", { id: 11010, tag:["organ"], free: false } ],
  ["progressive_organ", { id: 11011, tag:["organ"], free: false } ],

  /*
    111**
    - synth lead
  */
  ["poly_synth", { id: 11101, tag:["computer","solid"], free: true } ],
  ["fat_synth", { id: 11102, tag:["computer","big"], free: true } ],
  ["mellow_synth", { id: 11103, tag:["computer","soft"], free: false } ],
  ["cold_synth", { id: 11104, tag:["computer","solid"], free: false } ],
  ["friendly_synth", { id: 11105, tag:["computer","solid"], free: false } ],
  ["vibrate_synth", { id: 11106, tag:["computer","big"], free: false } ],
  ["solid_synth", { id: 11107, tag:["computer","solid"], free: false } ],
  ["small_synth", { id: 11108, tag:["computer","small"], free: false } ],
  ["popping_synth", { id: 11109, tag:["computer","solid"], free: false } ],

  /*
    112**
    - synth pad
  */
  ["string_pad", { id: 11201, tag:["computer","soft"], free: true } ],
  ["voice_pad", { id: 11202, tag:["computer","soft"], free: false } ],
  ["glass_pad", { id: 11203, tag:["computer","soft"], free: false } ],
  ["pure_pad", { id: 11204, tag:["computer","soft"], free: false } ],

  /*
    113**
    - bass
  */
  ["mono_bass", { id: 11301, tag:["computer","bass"], free: true } ],
  ["linear_bass", { id: 11302, tag:["computer","bass"], free: false } ],
  ["elementary_bass", { id: 11303, tag:["computer","bass"], free: false } ],
  ["subway_bass", { id: 11304, tag:["computer","bass"], free: false } ],
  ["flat_bassist", { id: 11305, tag:["band","bass"], free: true } ],
  ["gentle_bassist", { id: 11306, tag:["band","bass"], free: false } ],
  ["tall_bassist", { id: 11307, tag:["band","bass"], free: false } ],
  ["floating_bass", { id: 11308, tag:["computer","bass"], free: false } ],
  ["labo_bass", { id: 11309, tag:["computer","bass"], free: false } ],
  ["blended_bass", { id: 11310, tag:["computer","bass"], free: false } ],
  ["flanger_bass", { id: 11311, tag:["computer","bass"], free: false } ],
  ["one_bass", { id: 11312, tag:["computer","bass"], free: false } ],

  /*
    115**
    - guitar
  */
  ["jazz_guitar", { id: 11501, tag:["acoustic","guitar"], free: true } ],
  ["rock_guitar", { id: 11502, tag:["band","guitar"], free: true } ],
  ["distorted_guitar", { id: 11503, tag:["band","guitar"], free: false } ],
  ["nylon_guitar", { id: 11504, tag:["acoustic","guitar"], free: false } ],
  ["hero_guitar", { id: 11505, tag:["band","guitar"], free: false } ],
  ["harmonics_guitar", { id: 11506, tag:["band","guitar"], free: false } ],
  ["fat_guitar", { id: 11507, tag:["band","guitar"], free: false } ],

  /*
    116**
    - brass, string
  */
  ["trumpet", { id: 11601, tag:["brass"], free: true } ],
  ["trombone", { id: 11602, tag:["brass"], free: false } ],
  ["brass_family", { id: 11603, tag:["brass"], free: false } ],
  ["brass_group", { id: 11604, tag:["brass"], free: false } ],
  ["violin", { id: 11605, tag:["string"], free: true } ],
  ["viola", { id: 11606, tag:["string"], free: false } ],
  ["cello", { id: 11607, tag:["string"], free: false } ],
  ["strings_family", { id: 11608, tag:["string"], free: false } ],
  ["pizzicato", { id: 11609, tag:["string"], free: false } ],

  /*
    117**
    - ethnic, others
  */
  ["steel_pan", { id: 11801, tag:["ethnic","percussion"], free: false } ],
  ["kalimba", { id: 11802, tag:["ethnic", "percussion"], free: false } ],
  ["small_bell", { id: 11803, tag:["bell"], free: false } ],
  ["ocarina", { id: 11804, tag:["acoustic", "soft"], free: false } ],
  ["djembe", { id: 11805, tag:["ethnic", "percussion"], free: false } ],
  ["koto", { id: 11806, tag:["ethnic"], free: false } ],

  /*
    21***
    - drums
  */
  ["my_band", { id: 21001, tag:["human_drums"], free: true } ],
  ["compact_street", { id: 21002, tag:["human_drums"], free: false } ],
  ["modern_street", { id: 21003, tag:["human_drums"], free: false } ],
  ["bigger_street", { id: 21004, tag:["human_drums"], free: false } ],
  ["clean_room", { id: 21005, tag:["human_drums"], free: false } ],
  ["school_band", { id: 21006, tag:["human_drums"], free: false } ],

  ["small_cube", { id: 21101, tag:["computer_drums"], free: true } ],
  ["quiet_cube", { id: 21102, tag:["computer_drums"], free: false } ],
  ["dance_factory", { id: 21103, tag:["computer_drums"], free: false } ],
  ["disco_factory", { id: 21104, tag:["computer_drums"], free: false } ],
  ["cyber_dive", { id: 21105, tag:["computer_drums"], free: false } ],

  ["jungle_band", { id: 21201, tag: ["human_drums","percussion"], free: false }]

])

module.exports = SOUND_NAME
