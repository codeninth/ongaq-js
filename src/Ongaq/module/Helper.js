import AudioCore from "../module/AudioCore"
import defaults from "../module/defaults"
let wave = new Float32Array(6)

const Helper =  {

    /*
        @toInt
        指定された範囲の整数かどうかを検証しつつ
        引数を整数に変換する
    */
    toInt: (v,o = {})=>{
        let max = typeof o.max === "number" ? o.max : Number.POSITIVE_INFINITY
        let min = typeof o.min === "number" ? o.min : Number.NEGATIVE_INFINITY
        let base = typeof o.min === "number" ? o.base : 10
        let int = parseInt(v,base)
        if(
            !Number.isNaN(int) &&
      int <= max &&
      int >= min
        ){
            return int
        } else {
            return false
        }
    },

    /*
        @getUUID
        uuid文字列を生成する
    */
    getUUID: digit=>{
        let uuid = "", i, random
        for (i = 0; i < 32; i++) {
            random = Math.random() * 16 | 0
            if (i == 8 || i == 12 || i == 16 || i == 20) uuid += "-"
            uuid += (i == 12 ? 4 : (i == 16 ? (random & 3 | 8) : random)).toString(16)
        }
        if("number" === typeof digit) uuid = uuid.slice(0,digit)
        return uuid
    },

    /*
        @getWaveShapeArray
        ゆるやかに0に向かうカーブを生成するための配列を返す
    */
    getWaveShapeArray: v=>{
        let volume = v && (v >= 0 && v <= 1) ? v : defaults.NOTE_VOLUME
        wave[0] = 1 * volume * AudioCore.SUPPRESSION
        wave[1] = 0.8 * volume * AudioCore.SUPPRESSION
        wave[2] = 0.5 * volume * AudioCore.SUPPRESSION
        wave[3] = 0.3 * volume * AudioCore.SUPPRESSION
        wave[4] = 0.1 * volume * AudioCore.SUPPRESSION
        wave[5] = 0.0
        return wave
    },

    /*
    @toKeyList
        raw: string or array or KeyList or function

        型がさまざまな可能性のある引数から
        ["C2#","A2"] のような配列か false を返す。
    */
    toKeyList: (raw,beatIndex,measure)=>{
        if(!raw) return false
        else if(Array.isArray(raw)) return raw
        else if(Array.isArray(raw.list)) return raw.list
        else if (typeof raw === "function") return beatIndex >= 0 && raw(beatIndex, measure)
        else if(typeof raw === "string") return [raw]
        else return false
    },

    /*
    @toLength
        raw: string or array or KeyList or function

        型がさまざまな可能性のある引数から
        何拍分かを表す相対値を整数で返す。
    */
    toLength: (raw,beatIndex,measure)=>{
        switch(typeof raw){
        case "number":
            return raw
        case "function":
            return beatIndex >= 0 && raw(beatIndex,measure)
        default:
            return false
        }
    }

}

export default Helper
