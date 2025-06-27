import State from "../../Base/State";
import { StateMachine } from "../../Base/StateMachine";
import { DIRECTION_ENUM, DIRECTION_ORDER_ENUM, PARAMS_NAME_ENUM, SPIKE_COUNT_ENUM, SPIKES_COUNT_MAP_NUMBER_ENUM } from "../../Enums";
import SpikesSubStateMachine from "./SpikesSubStateMachine";

const BASE_URL = 'texture/spikes/spikestwo/'

export default class SpikesTwoSubStateMachine extends SpikesSubStateMachine{
  constructor(fsm:StateMachine){
    super(fsm)
    this.stateMachines.set(SPIKE_COUNT_ENUM.ZERO,new State(fsm, BASE_URL + 'zero'))
    this.stateMachines.set(SPIKE_COUNT_ENUM.ONE,new State(fsm, BASE_URL + 'one'))
    this.stateMachines.set(SPIKE_COUNT_ENUM.TWO,new State(fsm, BASE_URL + 'two'))
    this.stateMachines.set(SPIKE_COUNT_ENUM.THREE,new State(fsm, BASE_URL + 'three'))
  }
}
