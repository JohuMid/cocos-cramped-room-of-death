
import { _decorator, AnimationClip, Component, Node, Animation, SpriteFrame } from 'cc';
import { getInitParamsNumber, getInitParamsTrigger, StateMachine } from '../../Base/StateMachine';
import { ENTITY_STATE_ENUM, PARAMS_NAME_ENUM } from '../../Enums';
import IdleSubStateMachine from './IdleSubStateMachine';
import DeathSubStateMachine from './DeathSubStateMachine';
import { EntityManager } from '../../Base/EntityManager';


const { ccclass, property } = _decorator;

@ccclass('SmokeStateMachine')
export class SmokeStateMachine extends StateMachine {
  async init(){
    this.animationComponent = this.addComponent(Animation)
    this.initParams()
    this.initStateMachines()
    this.initAnimationEvent()

    await Promise.all(this.waitingList)
  }

  initParams(){
    this.params.set(PARAMS_NAME_ENUM.IDLE,getInitParamsTrigger())
    this.params.set(PARAMS_NAME_ENUM.DEATH,getInitParamsTrigger())
    this.params.set(PARAMS_NAME_ENUM.DIRECTION,getInitParamsNumber())
  }

  initStateMachines(){
    this.stateMachines.set(PARAMS_NAME_ENUM.IDLE,new IdleSubStateMachine(this))
    this.stateMachines.set(PARAMS_NAME_ENUM.DEATH,new DeathSubStateMachine(this))
  }

  initAnimationEvent(){
    this.animationComponent.on(Animation.EventType.FINISHED,()=>{
      const name = this.animationComponent.defaultClip.name
      const whiteList = ['idle']
      if (whiteList.some(v=>name.includes(v))) {
        this.node.getComponent(EntityManager).state = ENTITY_STATE_ENUM.DEATH
        // this.setParams(PARAMS_NAME_ENUM.IDLE,true)
      }
    })
  }

  run(){
    switch(this.currentState){
      case this.stateMachines.get(PARAMS_NAME_ENUM.IDLE):
      case this.stateMachines.get(PARAMS_NAME_ENUM.DEATH):
        if(this.params.get(PARAMS_NAME_ENUM.IDLE).value){
          this.currentState = this.stateMachines.get(PARAMS_NAME_ENUM.IDLE)
        } else if(this.params.get(PARAMS_NAME_ENUM.DEATH).value){
          this.currentState = this.stateMachines.get(PARAMS_NAME_ENUM.DEATH)
        } else{
          this.currentState = this.currentState
        }
        break;
      default:
        this.currentState = this.stateMachines.get(PARAMS_NAME_ENUM.IDLE)
        break;
    }
  }
}
