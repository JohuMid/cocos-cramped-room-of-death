import { _decorator, Component, Sprite, UITransform, Animation, animation, AnimationClip, Vec3, SpriteFrame } from "cc";
import { CONTROLLER_ENUM, DIRECTION_ENUM, DIRECTION_ORDER_ENUM, ENTITY_STATE_ENUM, ENTITY_TYPE_ENUM, EVENT_ENUM, PARAMS_NAME_ENUM } from "../../Enums";
import { EntityManager } from "../../Base/EntityManager";
import { WoodenSkeletonStateMachine } from "./WoodenSkeletonStateMachine";

const { ccclass, property } = _decorator;

@ccclass('WoodenSkeletonManager')
export class WoodenSkeletonManager extends EntityManager {
  private readonly speed = 1/10

  async init() {

    this.fsm = this.addComponent(WoodenSkeletonStateMachine)
    await this.fsm.init()
    super.init({
      x:7,
      y:7,
      direction:DIRECTION_ENUM.TOP,
      state:ENTITY_STATE_ENUM.IDLE,
      type:ENTITY_TYPE_ENUM.PLAYER
    })
  }

  update(dt:number){
    super.update(dt)
  }
}
