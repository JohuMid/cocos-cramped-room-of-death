import { _decorator, AnimationClip, Component, Node, Animation, SpriteFrame } from 'cc';
import { FSM_PARAMS_TYPE_ENUM } from '../Enums';
import State from './State';
import { SubStateMechine } from './SubStateMechine';
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

export const getInitParamsNumber = () =>{
  return {
    type:FSM_PARAMS_TYPE_ENUM.NUMBER,
    value:0
  }
}

@ccclass('StateMachine')
export abstract class StateMachine extends Component {
  private _currentState:State | SubStateMechine = null

  params:Map<string,IParamsValue> = new Map()
  stateMachines:Map<string,State | SubStateMechine> = new Map()
  animationComponent:Animation
  waitingList:Array<Promise<SpriteFrame[]>> = []

  getParams(paramName: string) {
    if (this.params.has(paramName)) {
      return this.params.get(paramName).value
    }
  }

  setParams(paramName: string, value: ParamsValueType) {
    if (this.params.has(paramName)) {
      this.params.get(paramName).value = value
      this.run()
      this.resetTrigger()
    }
  }

  get currentState() {
    return this._currentState
  }

  set currentState(newState) {
    if (!newState) {
      return
    }
    this._currentState = newState
    this._currentState.run()
  }

  // 重置触发状态
  resetTrigger() {
    for (const [, value] of this.params) {
      if (value.type === FSM_PARAMS_TYPE_ENUM.TRIGGER) {
        value.value = false
      }
    }
  }

  abstract init() :void
  abstract run() :void
}
