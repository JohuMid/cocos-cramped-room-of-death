import Singleton from "../Base/Singleton"
import { ITile } from "../Levels"

export default class DataManager extends Singleton {

  static get Instance(){
    return super.getInstance<DataManager>()
  }
  mapInfo:Array<Array<ITile>>
  mapRowCount:number = 0
  mapColumCount:number = 0
  levelIndex:number = 1

  reset(){
    this.mapInfo = []
    this.mapRowCount = 0
    this.mapColumCount = 0
  }
}
