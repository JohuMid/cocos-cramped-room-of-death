import { AnimationClip } from "cc";
import State from "../../Base/State";
import { StateMachine } from "../../Base/StateMachine";
import { SubStateMechine } from "../../Base/SubStateMechine";
import { DIRECTION_ENUM, DIRECTION_ORDER_ENUM, PARAMS_NAME_ENUM } from "../../Enums";
import DirectionSubStateMachine from "../../Base/DirectionSubStateMachine";

const BASE_URL = 'texture/player/turnleft/'

export default class TurnLeftSubStateMachine extends DirectionSubStateMachine{
  constructor(fsm:StateMachine){
    super(fsm)
    this.stateMachines.set(DIRECTION_ENUM.TOP,new State(fsm, BASE_URL + 'top'))
    this.stateMachines.set(DIRECTION_ENUM.BOTTOM,new State(fsm, BASE_URL + 'bottom'))
    this.stateMachines.set(DIRECTION_ENUM.LEFT,new State(fsm, BASE_URL + 'left'))
    this.stateMachines.set(DIRECTION_ENUM.RIGHT,new State(fsm, BASE_URL + 'right'))
  }

  init(){

  }

  run(){
    const value = this.fsm.getParams(PARAMS_NAME_ENUM.DIRECTION)
    this.currentState = this.stateMachines.get(DIRECTION_ORDER_ENUM[value as number])
  }
}
