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
const plugin = (()=>{

    return (o = {},graph = {})=>{

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
            _key = Helper.toKeyList(pair[0], graph.noteIndex, graph.measure )
            _length = Helper.toLength(pair[1], graph.noteIndex, graph.measure )
            if(!_key || !_length) return false

            _key.forEach(k=>{
                newLayer.push({
                    invoker: "audioBufferLine",
                    data: {
                        buffer: {
                            sound: graph.sound,
                            length: pair[1] * graph.secondsPerNote,
                            key: k,
                            startTime: graph.noteTime + distance * graph.secondsPerNote
                        },
                        volume: pair[2] >= 0 && pair[2] <= 1 ? pair[2] : ( o.volume >= 0 && o.volume <= 1 ? o.volume : null),
                        secondsPerNote: graph.secondsPerNote
                    }
                })
            })


        })

        return newLayer

    }

}).call(undefined,window || {})

export default plugin
