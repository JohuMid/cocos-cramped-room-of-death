import { EnemyManager } from "../Base/EnemyManager"
import Singleton from "../Base/Singleton"
import { ILevel, ITile } from "../Levels"
import { BurstManager } from "../Scripts/Burst/BurstManager"
import { DoorManager } from "../Scripts/Door/DoorManager"
import { PlayerManager } from "../Scripts/Player/PlayerManager"
import { SmokeManager } from "../Scripts/Smoke/SmokeManager"
import { SpikesManager } from "../Scripts/Spikes/SpikesManager"
import { TileManager } from "../Scripts/Tile/TileManager"

export type IRecord = Omit<ILevel,'mapInfo'>

export default class DataManager extends Singleton {

  static get Instance(){
    return super.getInstance<DataManager>()
  }
  mapInfo:Array<Array<ITile>>
  tileInfo:Array<Array<TileManager>>
  mapRowCount:number = 0
  mapColumnCount:number = 0
  levelIndex:number = 1
  player:PlayerManager
  door:DoorManager
  enemies:EnemyManager[]
  bursts:BurstManager[]
  spikes:SpikesManager[]
  smokes:SmokeManager[]
  records:IRecord[]

  reset(){
    this.mapInfo = []
    this.tileInfo = []
    this.player = null
    this.mapRowCount = 0
    this.mapColumnCount = 0
    this.enemies = []
    this.bursts = []
    this.spikes = []
    this.smokes = []
    this.records = []
  }
}
