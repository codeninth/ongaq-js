const DEFAULT = {
    NOTE_LENGTH: 4
}
//========================================
/*
  o: {
    key: ["1$1","1$3"],
    active: n=>n%4
  }
*/

const plugin = (()=>{

    return (o = {},graph = {})=>{

        /*
            ["1$2","1$8"]
            のような配列 key を求める。

            Chordオブジェクトが渡された / key() で返ってきた場合、
            Chord.key を用いる。
            */
        let key = ((key)=>{
            let _key
            
            switch(typeof key){

            case "string":
                return [key]

            case "function":
                _key = key(graph.noteIndex)
                if(_key){
                    if(Array.isArray(_key)) return _key
                    else if (Array.isArray(_key.key)) return _key.key
                    else if(typeof _key === "string") return [_key]
                    else return false
                } else {
                    return false
                }

            case "object":
                if(Array.isArray(key)) return key
                return false

            default:
                return false
            }

        })(o.key)
        if(!key) return false

        /*
      音を再生する拍数 length を求める
    */
        let length = (()=>{
            if(!o.length) return DEFAULT.NOTE_LENGTH
            switch(typeof o.length){
            case "number":
                return o.length
            case "function":
                return o.length(graph.noteIndex)
            default:
                return false
            }
        })()
        if(!length) return false

        let newLayer = key.map(k=>{

            return {
                invoker: "audioBufferLine",
                data: {
                    buffer: {
                        sound: graph.sound,
                        length: length * graph.secondsPerNote,
                        key: k,
                        startTime: graph.noteTime
                    },
                    volume: o.volume >= 0 && o.volume <= 1 ? o.volume : null,
                    secondsPerNote: graph.secondsPerNote,
                    targetIndex: 0
                }
            }

        })

        return newLayer

    }

}).call(undefined,window)

export default plugin
