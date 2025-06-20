import { _decorator, Component, Sprite, UITransform, Animation, animation, AnimationClip, Vec3, SpriteFrame } from "cc";
import { TILE_HEIGHT, TILE_WIDTH } from "../Tile/TileManager";;
import { CONTROLLER_ENUM, DIRECTION_ENUM, DIRECTION_ORDER_ENUM, ENTITY_STATE_ENUM, ENTITY_TYPE_ENUM, EVENT_ENUM, PARAMS_NAME_ENUM } from "../../Enums";
import EventManager from "../../Runtime/EventManager";
import { PlayerStateMachine } from "./PlayerStateMachine";
import { EntityManager } from "../../Base/EntityManager";

const { ccclass, property } = _decorator;



@ccclass('PlayerManager')
export class PlayerManager extends EntityManager {
  targetX:number = 0
  targetY:number = 0

  private readonly speed = 1/10

  async init() {

    this.fsm = this.addComponent(PlayerStateMachine)
    await this.fsm.init()
    super.init({
      x:0,
      y:0,
      direction:DIRECTION_ENUM.TOP,
      state:ENTITY_STATE_ENUM.IDLE,
      type:ENTITY_TYPE_ENUM.PLAYER
    })

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
    super.update(dt)
  }
}
