import { _decorator, Component, Sprite, UITransform, Animation, animation, AnimationClip, Vec3, SpriteFrame } from "cc";
import { EnemyManager } from "../../Base/EnemyManager";
import { IEntity } from "../../Levels";
import { IronSkeletonStateMachine } from "./IronSkeletonStateMachine";

const { ccclass, property } = _decorator;

@ccclass('IronSkeletonManager')
export class IronSkeletonManager extends EnemyManager {

  async init(params: IEntity) {
    this.fsm = this.addComponent(IronSkeletonStateMachine)
    this.fsm.init()
    super.init(params)
  }
  protected onDestroy(): void {
  }
}
