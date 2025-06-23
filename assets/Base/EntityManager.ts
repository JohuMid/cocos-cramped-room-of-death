import { _decorator, Component, Sprite, UITransform, Animation, animation, AnimationClip, Vec3, SpriteFrame } from "cc";

import { IEntity } from "../Levels";
import { DIRECTION_ENUM, ENTITY_STATE_ENUM, PARAMS_NAME_ENUM, DIRECTION_ORDER_ENUM, ENTITY_TYPE_ENUM } from "../Enums";
import { TILE_WIDTH, TILE_HEIGHT } from "../Scripts/Tile/TileManager";
import { StateMachine } from "./StateMachine";

const { ccclass, property } = _decorator;

@ccclass('EntityManager')
export class EntityManager extends Component {
  x:number = 0
  y:number = 0
  fsm:StateMachine

  private _direction:DIRECTION_ENUM
  private _state:ENTITY_STATE_ENUM
  private type:ENTITY_TYPE_ENUM

  get direction(){
    return this._direction
  }

  set direction(value:DIRECTION_ENUM){
    this._direction = value
    this.fsm.setParams(PARAMS_NAME_ENUM.DIRECTION,DIRECTION_ORDER_ENUM[this._direction])
  }

  get state(){
    return this._state
  }

  set state(value:ENTITY_STATE_ENUM){
    this._state = value
    this.fsm.setParams(this._state,true)
  }

  async init(params:IEntity) {
    const sprite = this.addComponent(Sprite)
    sprite.sizeMode = Sprite.SizeMode.CUSTOM

    const transForm = this.getComponent(UITransform)
    transForm.setContentSize(TILE_WIDTH * 4,TILE_HEIGHT * 4)

    this.x = params.x
    this.y = params.y
    this.type = params.type
    this.direction = params.direction
    this.state = params.state
  }

  update(dt:number){
    this.node.setPosition(this.x * TILE_WIDTH - TILE_WIDTH * 1.5, -this.y * TILE_HEIGHT + TILE_HEIGHT * 1.5)
  }
}
