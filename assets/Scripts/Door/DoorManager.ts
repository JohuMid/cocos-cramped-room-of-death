import { _decorator, Component, Sprite, UITransform, Animation, animation, AnimationClip, Vec3, SpriteFrame } from "cc";
import { CONTROLLER_ENUM, DIRECTION_ENUM, DIRECTION_ORDER_ENUM, ENTITY_STATE_ENUM, ENTITY_TYPE_ENUM, EVENT_ENUM, PARAMS_NAME_ENUM } from "../../Enums";
import { EntityManager } from "../../Base/EntityManager";
import EventManager from "../../Runtime/EventManager";
import { DoorStateMachine } from "./DoorStateMachine";
import DataManager from "../../Runtime/DataManager";
import { IEntity } from "../../Levels";

const { ccclass, property } = _decorator;

@ccclass('DoorManager')
export class DoorManager extends EntityManager {
  private readonly speed = 1/10

  async init(params: IEntity) {

    this.fsm = this.addComponent(DoorStateMachine)
    await this.fsm.init()
    super.init(params)

    EventManager.Instance.on(EVENT_ENUM.DOOR_OPEN, this.onOpen, this)
  }
  protected onDestroy(): void {
    EventManager.Instance.off(EVENT_ENUM.DOOR_OPEN, this.onOpen)
  }
  onOpen(){
    if((DataManager.Instance.enemies.every(enemy => enemy.state === ENTITY_STATE_ENUM.DEATH) && this.state != ENTITY_STATE_ENUM.DEATH)){
      this.state = ENTITY_STATE_ENUM.DEATH
    }
  }

}
