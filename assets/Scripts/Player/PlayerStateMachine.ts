import { _decorator, AnimationClip, Component, Node, Animation, SpriteFrame } from 'cc';
import { FSM_PARAMS_TYPE_ENUM, PARAMS_NAME_ENUM } from '../../Enums';
import State from '../../Base/State';
import { StateMachine } from '../../Base/StateMachine';
const { ccclass, property } = _decorator;

type ParamsValueType = Boolean | number

export interface IParamsValue{
  type:FSM_PARAMS_TYPE_ENUM
  value:ParamsValueType
}

export const getInitParamsTrigger = ()=>{
  return {
    type:FSM_PARAMS_TYPE_ENUM.TRIGGER,
    value:false
  }
}

@ccclass('PlayerStateMachine')
export class PlayerStateMachine extends StateMachine {
  async init(){
    this.animationComponent = this.addComponent(Animation)
    this.initParams()
    this.initStateMachines()
    this.initAnimationEvent()

    await Promise.all(this.waitingList)
  }

  initParams(){
    this.params.set(PARAMS_NAME_ENUM.IDLE,getInitParamsTrigger())
    this.params.set(PARAMS_NAME_ENUM.TURNLEFT,getInitParamsTrigger())
  }

  initStateMachines(){
    this.stateMachines.set(PARAMS_NAME_ENUM.IDLE,new State(this,'texture/player/idle/top',AnimationClip.WrapMode.Loop))
    this.stateMachines.set(PARAMS_NAME_ENUM.TURNLEFT,new State(this,'texture/player/turnleft/top'))
  }

  initAnimationEvent(){
    this.animationComponent.on(Animation.EventType.FINISHED,()=>{
      const name = this.animationComponent.defaultClip.name
      const whiteList = ['turn']
      if (whiteList.some(v=>name.includes(v))) {
        this.setParams(PARAMS_NAME_ENUM.IDLE,true)
      }
    })
  }

  run(){
    switch(this.currentState){
      case this.stateMachines.get(PARAMS_NAME_ENUM.TURNLEFT):
      case this.stateMachines.get(PARAMS_NAME_ENUM.IDLE):
        if (this.params.get(PARAMS_NAME_ENUM.TURNLEFT).value) {
          this.currentState = this.stateMachines.get(PARAMS_NAME_ENUM.TURNLEFT)
        } else if(this.params.get(PARAMS_NAME_ENUM.IDLE).value){
          this.currentState = this.stateMachines.get(PARAMS_NAME_ENUM.IDLE)
        }
        break;
      default:
        this.currentState = this.stateMachines.get(PARAMS_NAME_ENUM.IDLE)
        break;
    }
  }
}
