import { _decorator, Component, Sprite, UITransform, Animation, animation, AnimationClip, Vec3, SpriteFrame } from "cc";
import { CONTROLLER_ENUM, DIRECTION_ENUM, DIRECTION_ORDER_ENUM, ENTITY_STATE_ENUM, ENTITY_TYPE_ENUM, EVENT_ENUM, PARAMS_NAME_ENUM } from "../../Enums";
import { EntityManager } from "../../Base/EntityManager";
import { WoodenSkeletonStateMachine } from "./WoodenSkeletonStateMachine";
import EventManager from "../../Runtime/EventManager";
import DataManager from "../../Runtime/DataManager";

const { ccclass, property } = _decorator;

@ccclass('WoodenSkeletonManager')
export class WoodenSkeletonManager extends EntityManager {
  private readonly speed = 1/10

  async init() {

    this.fsm = this.addComponent(WoodenSkeletonStateMachine)
    await this.fsm.init()
    super.init({
      x:2,
      y:4,
      direction:DIRECTION_ENUM.TOP,
      state:ENTITY_STATE_ENUM.IDLE,
      type:ENTITY_TYPE_ENUM.PLAYER
    })

    EventManager.Instance.on(EVENT_ENUM.PLAYER_BORN, this.onChangeDirection, this)
    EventManager.Instance.on(EVENT_ENUM.PLAYER_MOVE_END, this.onChangeDirection, this)
    EventManager.Instance.on(EVENT_ENUM.PLAYER_MOVE_END, this.onAttack, this)
  }

  async onChangeDirection(isInit:boolean = false){
    if (!DataManager.Instance.player) {
      return
    }
    const {x:playerX,y:playerY} = DataManager.Instance.player
    const disX = Math.abs(this.x - playerX)
    const disY = Math.abs(this.y - playerY)

    if (disX === disY && !isInit) {
      return
    }

    if (playerX >= this.x && playerY <= this.y) {
      this.direction = disY>disX?DIRECTION_ENUM.TOP:DIRECTION_ENUM.RIGHT
    }else if (playerX <= this.x && playerY <= this.y) {
      this.direction = disY>disX?DIRECTION_ENUM.TOP:DIRECTION_ENUM.LEFT
    }else if (playerX <= this.x && playerY >= this.y) {
      this.direction = disY>disX?DIRECTION_ENUM.BOTTOM:DIRECTION_ENUM.LEFT
    }else if (playerX >= this.x && playerY >= this.y) {
      this.direction = disY>disX?DIRECTION_ENUM.BOTTOM:DIRECTION_ENUM.RIGHT
    }
  }

  onAttack(){
    const {x:playerX,y:playerY} = DataManager.Instance.player
    if ((this.x === playerX && Math.abs(this.y - playerY)<=1)||(this.y === playerY && Math.abs(this.x-playerX)<=1)) {
      this.state = ENTITY_STATE_ENUM.ATTACK
    } else{
      this.state = ENTITY_STATE_ENUM.IDLE
    }
  }

  update(dt:number){
    super.update(dt)
  }
}
