import { TILE_TYPE_ENUM } from '../Enums';
import level1 from './level1';

export interface ITile {
  src:number | null,
  type:TILE_TYPE_ENUM | null
}

export interface ILevel {
  mapInfo:Array<Array<ITile>>
}

const levels:Record<string,ILevel> ={
    level1,
}

export default levels

/*
关卡数据
https://gitee.com/sli97/cocos-cramped-room-of-death/tree/master/assets/Levels
 */
