import { _decorator, AnimationClip, Component, Node, Animation, SpriteFrame } from 'cc';
import { FSM_PARAMS_TYPE_ENUM } from '../Enums';
import State from './State';
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

@ccclass('StateMachine')
export abstract class StateMachine extends Component {
  private _currentState:State = null

  params:Map<string,IParamsValue> = new Map()
  stateMachines:Map<string,State> = new Map()
  animationComponent:Animation
  waitingList:Array<Promise<SpriteFrame[]>> = []

  getParams(name:string){
    if (this.params.get(name)) {
      return this.params.get(name).value
    }
  }

  setParams(name:string,value:ParamsValueType){
    if(this.params.has(name)){
      this.params.get(name).value = value
      this.run()
    }
  }

  get currentState(){
    return this._currentState
  }

  set currentState(value){
    this._currentState = value
    this.currentState.run()
    this.resetTrigger()
  }

  // 重置触发状态
  resetTrigger(){
    for (const [_,value] of this.params) {
      if (value.type === FSM_PARAMS_TYPE_ENUM.TRIGGER) {
        value.value = false
      }
    }
  }

  abstract init() :void
  abstract run() :void
}
