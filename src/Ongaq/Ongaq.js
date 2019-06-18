import audioCore from "./module/AudioCore"
import bufferYard from "./module/BufferYard"
import manipulator from "./module/Manipulator"

const context = AudioCore.context

class Ongaq {

    constructor(o){
        this.init(o)
    }

    /*
      @init
    */
    init({ api_key, offline, resourcesPath, volume, bpm }){
        bufferYard.set({ api_key, offline, resourcesPath })
        this.volume = volume
        this.bpm = bpm
        return false
    }

    /*
      @import
      - jsonからtune/partオブジェクトを作成する
    */
    import(tune,o = {}){
        return new Promise((resolve,reject)=>{
            const p = manipulator.loadLoop(tune,o)
            p.then(resolve)
            p.catch(reject)
        })
    }

    /*
      @switch
      - 次に再生するLoopを選択し、quotaを再設定する
    */
    switch(o = {}){
        return new Promise((resolve,reject)=>{
            manipulator.switch(o) ? resolve() : reject()
        })
    }

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
    set bpm(v){ manipulator.setBpm(v) }

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
            originTime: audioCore.originTime,
            currentTime: context.currentTime,
            volume: manipulator.volume * 100
        }
    }

}

window.Ongaq = window.Ongaq || Ongaq

export default Ongaq
