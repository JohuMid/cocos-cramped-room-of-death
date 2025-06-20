import { _decorator, Component, Sprite, UITransform, Animation, animation, AnimationClip, Vec3, SpriteFrame } from "cc";
import { TILE_HEIGHT, TILE_WIDTH } from "../Tile/TileManager";;
import { CONTROLLER_ENUM, DIRECTION_ENUM, DIRECTION_ORDER_ENUM, ENTITY_STATE_ENUM, EVENT_ENUM, PARAMS_NAME_ENUM } from "../../Enums";
import EventManager from "../../Runtime/EventManager";
import { PlayerStateMachine } from "./PlayerStateMachine";

const { ccclass, property } = _decorator;



@ccclass('PlayerManager')
export class PlayerManager extends Component {
  x:number = 0
  y:number = 0
  targetX:number = 0
  targetY:number = 0

  private readonly speed = 1/10
  fsm:PlayerStateMachine

  private _direction:DIRECTION_ENUM
  private _state:ENTITY_STATE_ENUM

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

  async init() {
    const sprite = this.addComponent(Sprite)
    sprite.sizeMode = Sprite.SizeMode.CUSTOM

    const transForm = this.getComponent(UITransform)
    transForm.setContentSize(TILE_WIDTH * 4,TILE_HEIGHT * 4)

    this.fsm = this.addComponent(PlayerStateMachine)
    await this.fsm.init()
    this.direction = DIRECTION_ENUM.TOP
    this.state = ENTITY_STATE_ENUM.IDLE

    EventManager.Instance.on(EVENT_ENUM.PLAYER_CTRL, this.move, this)
  }

  updateXY(){
    if (this.targetX<this.x) {
      this.x -= this.speed
    } else if (this.targetX>this.x) {
      this.x += this.speed
    }

    if (this.targetY<this.y) {
      this.y -= this.speed
    } else if (this.targetY>this.y) {
      this.y += this.speed
    }

    if (Math.abs(this.targetX - this.x) < this.speed) {
      this.x = this.targetX
    }

    if (Math.abs(this.targetY - this.y) < this.speed) {
      this.y = this.targetY
    }
  }

  move(inputDirection:CONTROLLER_ENUM){
    if (inputDirection === CONTROLLER_ENUM.TOP) {
      this.targetY -= 1
    } else if (inputDirection === CONTROLLER_ENUM.BOTTOM) {
      this.targetY += 1
    } else if (inputDirection === CONTROLLER_ENUM.LEFT) {
      this.targetX -= 1
    } else if (inputDirection === CONTROLLER_ENUM.TURNLEFT) {
      if (this.direction === DIRECTION_ENUM.TOP) {
        this.direction = DIRECTION_ENUM.LEFT
      } else if (this.direction === DIRECTION_ENUM.LEFT) {
        this.direction = DIRECTION_ENUM.BOTTOM
      } else if (this.direction === DIRECTION_ENUM.BOTTOM) {
        this.direction = DIRECTION_ENUM.RIGHT
      } else if (this.direction === DIRECTION_ENUM.RIGHT) {
        this.direction = DIRECTION_ENUM.TOP
      }
      this.state = ENTITY_STATE_ENUM.TURNLEFT
    }
  }

  update(dt:number){
    this.updateXY()
    this.node.setPosition(this.x * TILE_WIDTH - TILE_WIDTH * 1.5, -this.y * TILE_HEIGHT + TILE_HEIGHT * 1.5)
  }
}
