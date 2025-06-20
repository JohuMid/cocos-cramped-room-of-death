import { PARAMS_NAME_ENUM, DIRECTION_ORDER_ENUM } from "../Enums"
import { SubStateMechine } from "./SubStateMechine"

export default class DirectionSubStateMachine extends SubStateMechine{
  init(){}
  run(){
    const value = this.fsm.getParams(PARAMS_NAME_ENUM.DIRECTION)
    this.currentState = this.stateMachines.get(DIRECTION_ORDER_ENUM[value as number])
  }
}
