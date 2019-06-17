import ROOT from "../Constants/ROOT"
import SCHEME from "../Constants/SCHEME"

const shiftKeys = (v,key)=>{

    if (v === 0 || v <= -13 || v >= 13) return key
    else if (!Array.isArray(key) ) return []
    
    let shifted = key.map(m => m.split("$").map(n => +n))

    shifted = shifted.map(pair => {
        if (pair[1] + v <= 12 && pair[1] + v > 0) return `${pair[0]}$${pair[1] + v}`
        else if (v < 0 && pair[1] + v <= 0) {
            /*
                - 下のオクターブへ移動する必要がある
                - もともと1オクターブだった場合それ以上下がれないのでこのキーはスキップする
                */
            if (pair[0] > 1) return `${pair[0] - 1}${12 - pair[1] + v}`
            else return false
        }
        else if (v > 0 && pair[1] + v > 12) {
            /*
                - 上のオクターブへ移動する必要がある
                - もともと4オクターブだった場合それ以上上がれないのでこのキーはスキップする
                */
            if (pair[0] < 4) return `${pair[0] + 1}${pair[1] + v - 12}`
        } else {
            return false
        }

    }).filter(pair => pair)

    return shifted
}

class Chord {

    /*
    raw: "C#M7" のような文字列
    o: {
        octave: 2,
        defaultShift: 0,
        key: ["1$5","1$11",...] // shift() などによって新しいChordオブジェクトを作る場合などに渡す
    }

    {
      root: ルートのindex, // 1
      rootLabel: "ルートの表記": // C
      scheme: 何度離れた音を重ねるか // [3,4,3]
      schemeLabel: "コードの表記" // #M7
      key: "bufferのファイル名に対応する表記" // ["1$1","1$4"]
      shift: 0 // 常に移調する場合の量
    }
  */
    constructor(raw, o = {}){
        this.init(raw,o)
    }

    init(raw,o){

        this.active = true
        this.defaultShift = o.defaultShift || 0
        this.defaultOctave = o.octave > 0 && o.octave <= 4 ? o.octave : 2

        if(typeof raw !== "string"){
            this.active = false
            return false
        }

        let rootData = (()=>{
            let result = [], root, rootLabel
            ROOT.forEach((v,k)=>{
                result = raw.match( new RegExp("^"+k) )
                if(result && result[0] === k){
                    root = v
                    rootLabel = k
                }
            })
            return { root, rootLabel }
        })()
        if(!rootData.root){
            this.active = false
            return false
        }

        let chordData = ((chord)=>{
            let scheme, schemeLabel
            SCHEME.forEach((v,k)=>{
                if(k === chord){
                    scheme = v
                    schemeLabel = k
                }
            })
            return { scheme, schemeLabel }
        })( raw.replace(rootData.rootLabel,"") )

        if(!chordData.scheme || !chordData.schemeLabel){
            this.active = false
            return false
        }

        let key = (()=>{

            if(o.key) return o.key

            let key = []
            let currentKey = rootData.root
            let currentOctave = this.defaultOctave

            key.push(`${currentOctave}$${currentKey}`)

            chordData.scheme.forEach(s=>{
                let doOctaveUp = currentKey + s > 12
                currentOctave = doOctaveUp ? currentOctave + 1 : currentOctave
                currentKey = doOctaveUp ? currentKey + s - 12 : currentKey + s
                if(currentOctave <= 4) key.push(`${currentOctave}$${currentKey}`)
            })
            return key

        })()

        this.rootLabel = rootData.rootLabel
        this.defaultOctave = o.octave
        this.scheme = chordData.scheme
        this.schemeLabel = chordData.schemeLabel
        this.originalKey = shiftKeys( this.defaultShift, key.map(k => k) )
        this.key = shiftKeys( this.defaultShift, key )

    }

    /*
        @shift
        オリジナルのコードを v だけ移調する。
    */
    shift(v){
        // this.key = shiftKeys( v, this.originalKey )
        return new Chord(this.name, {
            octave: this.defaultOctave,
            key: shiftKeys(v, this.originalKey)
        })
    }

    /*
        @octave
    */
    octave(v){
        if (v === 0 || typeof v !== "number" || Number.isNaN(v)) return this

        let newList = this.originalKey.map(m => m.split("$").map(n => +n))
        newList = newList.map(pair => {
            if (pair[0] + v <= 4 && pair[0] + v > 0) return `${pair[0] + v}$${pair[1]}`
        }).filter(pair => pair)
        return new Chord(this.name, {
            octave: this.defaultOctave,
            key: newList
        })
    }

    /*
        @reverse
        オリジナルのコードの構成音を逆にする。
    */
    reverse(){
        let newList = this.originalKey.reverse()
        return new Chord(this.name, {
            octave: this.defaultOctave,
            key: newList
        })
    }

    /*
        @slice
        元のコードの構成音の一部を返す。
    */
    slice(start,end){
        if (Number.isNaN(start)) return this
        let newList = this.originalKey.slice(start, end)
        return new Chord(this.name,{
            octave: this.defaultOctave,
            key: newList
        })
    }

    /*
        @turn
        1回 転回を行う
   */
    turn() {

        if (!this.key) return this

        let duplicated = this.originalKey.map(k => k)
        let last = duplicated.splice(-1, 1)[0]
        let first = duplicated.splice(0, 1)[0]
        let l = last.split("$").map(n => +n)
        let f = first.split("$").map(n => +n)

        let rolledKey = f[1]
        let rolledOctave = f[1] + l[1] > 12 ? l[0] + 1 : l[0]
        if (rolledOctave > 4) return this

        let newList = this.key.map(k => k).splice(1)
        newList.push(`${rolledOctave}$${rolledKey}`)

        // this.key = newList
        return new Chord(this.name, {
            octave: this.defaultOctave,
            key: newList
        })

    }

    get route(){
        return Array.isArray(this.key) && this.key[0]
    }

    get name(){
        return this.rootLabel + this.schemeLabel
    }

}

window.Chord = window.Chord || Chord

export default Chord
