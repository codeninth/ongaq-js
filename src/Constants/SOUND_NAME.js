const SOUND_NAME = new Map([

    /*
    110**
    - ピアノ系
  */
    ["piano",{ id: 11001, tag: ["piano"] }],
    ["bright_piano", { id: 11002, tag: ["piano"] }],
    ["bell_piano", { id: 11003, tag: ["piano"] }],
    ["clavi", { id: 11004, tag: ["piano"] }],

    /*
    111**
    - キーボード・オルガン系
  */
    ["keyboard_01", { id: 11101, tag: ["keyboard"] }],
    ["keyboard_02", { id: 11102, tag: ["keyboard"] }],
    ["organ", { id: 11103, tag: ["keyboard"] }],
    ["church_organ", { id: 11104, tag: ["keyboard"] }],

    /*
    112**
    - ベース系
  */
    ["minimal_synth_bass_01", { id:  11205, tag: ["bass"] }],

    /*
    113**
    - ギター系
  */
    ["n_guitar", { id: 11301, tag: ["guitar"] }],
    ["e_guitar_01", { id: 11302, tag: ["guitar"] }],
    ["e_guitar_02", { id: 11303, tag: ["guitar"] }],

    /*
    114**
    - パッド系
  */
    ["string_pad", { id: 11401, tag: ["soft"] }],
    ["voice_pad", { id: 11402, tag: ["soft"] }],

    /*
    115**
    - リード系
  */
    ["square_lead", { id: 11501, tag: ["solid"] }],
    ["solid_lead", { id: 11502, tag: ["solid"] }],

    /*
    116**
    -
  */

    /*
    117**
    - ノンジャンル
  */
    ["steel_pan", { id: 11701, tag: ["ethnic"] }],

    /*
    21***
    - ドラム系
  */
    ["basic_drums", { id: 21001, tag: ["real_drums"] }],
    ["standard_drums", { id: 21002, tag: ["real_drums"] }],
    ["hiphop_drums", { id: 21003, tag: ["big_drums"] }],
    ["trip_drums", { id: 21004, tag: ["big_drums"] }],
    ["room_drums", { id: 21005, tag: ["big_drums"] }],

    ["minimal_drums", { id: 21101, tag: ["small_drums"] }],
    ["simple_drums", { id: 21102, tag: ["small_drums"] }],
    ["dance_drums", { id: 21103, tag: ["small_drums"] }],
    ["techno_drums", { id: 21104, tag: ["small_drums"] }]

])

module.exports = SOUND_NAME
