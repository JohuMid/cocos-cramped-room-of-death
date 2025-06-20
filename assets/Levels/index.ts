import { DIRECTION_ENUM, ENTITY_STATE_ENUM, ENTITY_TYPE_ENUM, TILE_TYPE_ENUM } from '../Enums';
import level1 from './level1';
import level2 from './level2';

export interface IEntity{
  x:number,
  y:number,
  direction:DIRECTION_ENUM,
  state:ENTITY_STATE_ENUM,
  type:ENTITY_TYPE_ENUM
}

export interface ITile {
  src:number | null,
  type:TILE_TYPE_ENUM | null
}

export interface ILevel {
  mapInfo:Array<Array<ITile>>
}

const levels:Record<string,ILevel> ={
    level1,
    level2
}

export default levels

/*
关卡数据
https://gitee.com/sli97/cocos-cramped-room-of-death/tree/master/assets/Levels
 */
