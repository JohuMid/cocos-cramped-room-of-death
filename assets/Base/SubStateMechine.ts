import { _decorator } from 'cc';
import State from './State';
import { StateMachine } from './StateMachine';
const { ccclass, property } = _decorator;


export abstract class SubStateMechine {
  private _currentState:State = null
  stateMachines:Map<string,State> = new Map()

  constructor(public fsm:StateMachine){

  }

  get currentState(){
    return this._currentState
  }

  set currentState(value){
    this._currentState = value
    this.currentState.run()
  }

  abstract init() :void
  abstract run() :void
}
