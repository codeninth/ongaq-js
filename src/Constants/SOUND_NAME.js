const SOUND_NAME = new Map([

    /*
    110**
    - ピアノ系
  */
    ["piano",{ id: 11001, tag: ["h"], free: true }],
    ["bright_piano", { id: 11002, tag: ["h"], free: false }],
    ["bell_piano", { id: 11003, tag: ["h"], free: false }],
    ["clavi", { id: 11004, tag: ["h"], free: false }],

    /*
    111**
    - キーボード・オルガン系
  */
    ["keyboard_01", { id: 11101, tag: ["h"], free: true }],
    ["keyboard_02", { id: 11102, tag: ["h"], free: true }],
    ["organ", { id: 11103, tag: ["h"], free: false }],
    ["church_organ", { id: 11104, tag: ["h"], free: false }],

    /*
    112**
    - ベース系
  */
    ["minimal_synth_bass_01", { id:  11205, tag: ["b"], free: true }],

    /*
    113**
    - ギター系
  */
    ["n_guitar", { id: 11301, tag: ["h"], free: true }],
    ["e_guitar_01", { id: 11302, tag: ["h"], free: false }],
    ["e_guitar_02", { id: 11303, tag: ["h"], free: false }],

    /*
    114**
    - パッド系
  */
    ["string_pad", { id: 11401, tag: ["c_soft"], free: true }],
    ["voice_pad", { id: 11402, tag: ["c_soft"], free: false }],

    /*
    115**
    - リード系
  */
    ["square_lead", { id: 11501, tag: ["c_solid"], free: true }],
    ["solid_lead", { id: 11502, tag: ["c_solid"], free: false }],

    /*
    116**
    -
  */

    /*
    117**
    - ノンジャンル
  */
    ["steel_pan", { id: 11701, tag: ["h"], free: false }],

    /*
    21***
    - ドラム系
  */
    ["basic_drums", { id: 21001, tag: ["h_drums"], free: true }],
    ["standard_drums", { id: 21002, tag: ["h_drums"], free: false }],
    ["hiphop_drums", { id: 21003, tag: ["c_loud_drums"], free: false }],
    ["trip_drums", { id: 21004, tag: ["c_loud_drums"], free: false }],
    ["room_drums", { id: 21005, tag: ["c_loud_drums"], free: false }],

    ["minimal_drums", { id: 21101, tag: ["c_small_drums"], free: true }],
    ["simple_drums", { id: 21102, tag: ["c_small_drums"], free: false }],
    ["dance_drums", { id: 21103, tag: ["c_small_drums"], free: false }],
    ["techno_drums", { id: 21104, tag: ["c_small_drums"], free: false }]

])

module.exports = SOUND_NAME
