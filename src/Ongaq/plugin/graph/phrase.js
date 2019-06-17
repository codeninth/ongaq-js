import Helper from "../../module/Helper"

//========================================
/*
  o: {
    path: [
      [["2$1","2$5"],8],
      [null,4],
      [["2$8","2$11"],4,0.8]
    ],
    active: n=>n===0
  }

  pathの階層は
  [ キー名, 長さ, 音量]
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
        key, length を求める。
      */
            _key = Helper.toKeyList(pair[0],graph.noteIndex)
            _length = Helper.toLength(pair[1],graph.noteIndex)
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

}).call(undefined,window)

export default plugin
