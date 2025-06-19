import Singleton from "../Base/Singleton"
import { ITile } from "../Levels"

export default class DataManager extends Singleton {

  static get Instance(){
    return super.getInstance<DataManager>()
  }
  mapInfo:Array<Array<ITile>>
  mapRowCount:number
  mapColumCount:number
}
