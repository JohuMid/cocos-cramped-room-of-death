import { _decorator, Component, Sprite, UITransform, Animation, animation, AnimationClip, Vec3, SpriteFrame } from "cc";
import { IEntity } from "../Levels";
import DataManager from "../Runtime/DataManager";
import EventManager from "../Runtime/EventManager";
import { EntityManager } from "./EntityManager";
import { DIRECTION_ENUM, ENTITY_STATE_ENUM, ENTITY_TYPE_ENUM, EVENT_ENUM } from "../Enums";


const { ccclass, property } = _decorator;

@ccclass('EnemyManager')
export class EnemyManager extends EntityManager {

  async init(params: IEntity) {
    this.node.name = params.type
    super.init(params)

    EventManager.Instance.on(EVENT_ENUM.PLAYER_BORN, this.onChangeDirection, this)
    EventManager.Instance.on(EVENT_ENUM.PLAYER_MOVE_END, this.onChangeDirection, this)
    EventManager.Instance.on(EVENT_ENUM.ATTACK_ENEMY, this.onDead, this)
  }
  protected onDestroy(): void {
    EventManager.Instance.off(EVENT_ENUM.PLAYER_BORN, this.onChangeDirection)
    EventManager.Instance.off(EVENT_ENUM.PLAYER_MOVE_END, this.onChangeDirection)
    EventManager.Instance.off(EVENT_ENUM.ATTACK_ENEMY, this.onDead)
  }

  async onChangeDirection(isInit:boolean = false){
    if (!DataManager.Instance.player || this.state === ENTITY_STATE_ENUM.DEATH) {
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

  onDead(id:string){
    if (this.state === ENTITY_STATE_ENUM.DEATH) {
      return
    }
    if (this.id === id) {
      this.state = ENTITY_STATE_ENUM.DEATH
    }
  }

  update(dt:number){
    super.update(dt)
  }
}
