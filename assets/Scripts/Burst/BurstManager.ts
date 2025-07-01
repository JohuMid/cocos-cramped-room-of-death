import { _decorator, Component, Sprite, UITransform, Animation, animation, AnimationClip, Vec3, SpriteFrame } from "cc";
import EventManager from "../../Runtime/EventManager";
import DataManager from "../../Runtime/DataManager";
import { IEntity } from "../../Levels";
import { EVENT_ENUM, ENTITY_STATE_ENUM, SHAKE_TYPE_ENUM } from "../../Enums";
import { EntityManager } from "../../Base/EntityManager";
import { BurstStateMachine } from "./BurstStateMachine";
import { TILE_HEIGHT, TILE_WIDTH } from "../Tile/TileManager";

const { ccclass, property } = _decorator;

@ccclass('BurstManager')
export class BurstManager extends EntityManager {

  async init(params: IEntity) {
    this.fsm = this.addComponent(BurstStateMachine)
    await this.fsm.init()
    super.init(params)
    const transform = this.node.getComponent(UITransform)
    transform.setContentSize(TILE_WIDTH,TILE_HEIGHT)

    EventManager.Instance.on(EVENT_ENUM.PLAYER_MOVE_END, this.onBurst, this)
  }
  protected onDestroy(): void {
    EventManager.Instance.off(EVENT_ENUM.PLAYER_MOVE_END, this.onBurst)
  }

  onBurst(){
    if (this.state === ENTITY_STATE_ENUM.DEATH || !DataManager.Instance.player) {
      return
    }
    const {x:playerX,y:playerY,state:playerState} = DataManager.Instance.player
    if (this.x === playerX && this.y === playerY && this.state === ENTITY_STATE_ENUM.IDLE) {
      this.state = ENTITY_STATE_ENUM.ATTACK
    } else if(this.state === ENTITY_STATE_ENUM.ATTACK){
      this.state = ENTITY_STATE_ENUM.DEATH
      EventManager.Instance.emit(EVENT_ENUM.SCREEN_SHAKE,SHAKE_TYPE_ENUM.BOTTOM)
      if (this.x === playerX && this.y === playerY) {
        EventManager.Instance.emit(EVENT_ENUM.ATTACK_PLAYER, ENTITY_STATE_ENUM.AIRDEATH)
      }
    }
  }

  update(dt: number): void {
    this.node.setPosition(this.x * TILE_WIDTH , -this.y * TILE_HEIGHT)
  }
}
