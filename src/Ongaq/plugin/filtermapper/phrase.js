import Helper from "../../module/Helper"

//========================================
/*
  o: {
    path: [
      [["C2","G2"],8],
      [null,4],
      [["A2","D2#"],4,0.8]
    ],
    active: n=>n===0
  }

  layer of path:
  [ name_of_key, length, volume ]
*/
const plugin = (o = {},graph = {})=>{

    if(!Array.isArray(o.path) || o.path.length === 0) return false

    let distance = 0 // pathの開始から何拍目に移動したか
    let newLayer = []
    let _key, _length // 一時的な値を格納

    o.path.forEach(pair=>{

        if(pair.length < 2) return false
        if(pair[1] > 0) distance += pair[1]

        /*
            get key,length as same as "note" plugin
        */
        _key = Helper.toKeyList(pair[0], graph.beatIndex, graph.measure )
        _length = Helper.toLength(pair[1], graph.beatIndex, graph.measure )
        if(!_key || !_length) return false

        _key.forEach(k=>{
            newLayer.push({
                invoker: "audioBufferLine",
                data: {
                    buffer: {
                        sound: graph.sound,
                        length: pair[1] * graph._secondsPerBeat,
                        key: k,
                        startTime: graph.beatTime + distance * graph._secondsPerBeat
                    },
                    volume: pair[2] >= 0 && pair[2] <= 1 ? pair[2] : ( o.volume >= 0 && o.volume <= 100 ? o.volume / 100 : null)
                }
            })
        })

    })

    return newLayer

}

export default plugin
