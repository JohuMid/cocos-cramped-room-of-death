import { _decorator, AnimationClip, Component, Node, Animation, SpriteFrame } from 'cc';
import { ENTITY_STATE_ENUM, FSM_PARAMS_TYPE_ENUM, PARAMS_NAME_ENUM } from '../../Enums';
import { getInitParamsNumber, getInitParamsTrigger, StateMachine } from '../../Base/StateMachine';
import IdleSubStateMachine from './IdleSubStateMachine';
import TurnLeftSubStateMachine from './TurnLeftSubStateMachine';
import BlockFrontSubStateMachine from './BlockFrontSubStateMachine';
import { EntityManager } from '../../Base/EntityManager';
import BlockTurnLeftSubStateMachine from './BlockTurnLeftSubStateMachine';
import BlockTurnRightSubStateMachine from './BlockTurnRightSubStateMachine';
import TurnRightSubStateMachine from './TurnLRightSubStateMachine';
const { ccclass, property } = _decorator;



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
    this.params.set(PARAMS_NAME_ENUM.TURNRIGHT,getInitParamsTrigger())
    this.params.set(PARAMS_NAME_ENUM.BLOCKFRONT, getInitParamsTrigger())
    this.params.set(PARAMS_NAME_ENUM.BLOCKTURNLEFT, getInitParamsTrigger())
    this.params.set(PARAMS_NAME_ENUM.BLOCKTURNRIGHT, getInitParamsTrigger())
    this.params.set(PARAMS_NAME_ENUM.DIRECTION,getInitParamsNumber())
  }

  initStateMachines(){
    this.stateMachines.set(PARAMS_NAME_ENUM.IDLE,new IdleSubStateMachine(this))
    this.stateMachines.set(PARAMS_NAME_ENUM.TURNLEFT,new TurnLeftSubStateMachine(this))
    this.stateMachines.set(PARAMS_NAME_ENUM.TURNRIGHT,new TurnRightSubStateMachine(this))
    this.stateMachines.set(PARAMS_NAME_ENUM.BLOCKFRONT,new BlockFrontSubStateMachine(this))
    this.stateMachines.set(PARAMS_NAME_ENUM.BLOCKTURNLEFT,new BlockTurnLeftSubStateMachine(this))
    this.stateMachines.set(PARAMS_NAME_ENUM.BLOCKTURNRIGHT,new BlockTurnRightSubStateMachine(this))
  }

  initAnimationEvent(){
    this.animationComponent.on(Animation.EventType.FINISHED,()=>{
      const name = this.animationComponent.defaultClip.name
      const whiteList = ['block','turn']
      if (whiteList.some(v=>name.includes(v))) {
        this.node.getComponent(EntityManager).state = ENTITY_STATE_ENUM.IDLE
        // this.setParams(PARAMS_NAME_ENUM.IDLE,true)
      }
    })
  }

  run(){
    switch(this.currentState){
      case this.stateMachines.get(PARAMS_NAME_ENUM.TURNLEFT):
      case this.stateMachines.get(PARAMS_NAME_ENUM.TURNRIGHT):
      case this.stateMachines.get(PARAMS_NAME_ENUM.BLOCKFRONT):
      case this.stateMachines.get(PARAMS_NAME_ENUM.BLOCKTURNLEFT):
      case this.stateMachines.get(PARAMS_NAME_ENUM.IDLE):
        if (this.params.get(PARAMS_NAME_ENUM.BLOCKFRONT).value) {
          this.currentState = this.stateMachines.get(PARAMS_NAME_ENUM.BLOCKFRONT)
        } else if (this.params.get(PARAMS_NAME_ENUM.BLOCKTURNLEFT).value) {
          this.currentState = this.stateMachines.get(PARAMS_NAME_ENUM.BLOCKTURNLEFT)
        } else if (this.params.get(PARAMS_NAME_ENUM.TURNLEFT).value) {
          this.currentState = this.stateMachines.get(PARAMS_NAME_ENUM.TURNLEFT)
        } else if (this.params.get(PARAMS_NAME_ENUM.TURNRIGHT).value) {
          this.currentState = this.stateMachines.get(PARAMS_NAME_ENUM.TURNRIGHT)
        } else if (this.params.get(PARAMS_NAME_ENUM.BLOCKTURNRIGHT).value) {
          this.currentState = this.stateMachines.get(PARAMS_NAME_ENUM.BLOCKTURNRIGHT)
        } else if(this.params.get(PARAMS_NAME_ENUM.IDLE).value){
          this.currentState = this.stateMachines.get(PARAMS_NAME_ENUM.IDLE)
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
