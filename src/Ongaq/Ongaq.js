import AudioCore from "./module/AudioCore"
import BufferYard from "./module/BufferYard"
import manipulator from "./module/Manipulator"

const context = AudioCore.context

class Ongaq {

    constructor(o){
        this.init(o)
    }

    /*
      @init
    */
    init({ api_key, volume, bpm }){
        BufferYard.set({ api_key })
        this.volume = volume
        this.bpm = bpm
        return false
    }

    /*
      @add
      - jsonからtune/partオブジェクトを作成する
    */
    add(part,o = {}){
        return new Promise((resolve,reject)=>{
          part.bpm = part.bpm || this.bpm
          const p = manipulator.add(part)
          p.then(resolve)
          p.catch(reject)
        })
    }

    /*
      @switch
      - 次に再生するLoopを選択し、quotaを再設定する
    */
    // switch(o = {}){
    //     return new Promise((resolve,reject)=>{
    //         manipulator.switch(o) ? resolve() : reject()
    //     })
    // }

    /*
      @set volume
      丸め誤差を防ぐため、整数にしてから扱う
      */
    set volume(v){
      manipulator.setVolume(v)
    }

    /*
      @set bpm
    */
    set bpm(v){
      manipulator.setBpm(v)
      this._bpm = v
    }
    get bpm(){
      return this._bpm
    }

    /*
      @start
      - 現在選択中のtuneを再生する
    */
    start(){
        return new Promise((resolve,reject)=>{
            manipulator.startScheduling()
            resolve()
        })
    }

    /*
      @pause
      - 現在選択中のtuneを停止する
    */
    pause(){
        return new Promise((resolve,reject)=>{
            manipulator.pauseScheduling()
            resolve()
        })
    }

    /*
    @find
    次のような形でLoop, Partオブジェクトを取得する

    {
      resource: "part",
      data: {
        name: "guitar_part"
      }
    }
  */
    find(o){
        return manipulator.find(o)
    }

    /*
      @get params
    */
    get params(){
        return {
            isPlaying: manipulator.isPlaying,
            originTime: AudioCore.originTime,
            currentTime: context.currentTime,
            volume: manipulator.volume * 100
        }
    }

}

window.Ongaq = window.Ongaq || Ongaq

export default Ongaq
