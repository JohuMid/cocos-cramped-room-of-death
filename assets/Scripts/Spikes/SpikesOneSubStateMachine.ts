import State from "../../Base/State";
import { StateMachine } from "../../Base/StateMachine";
import { DIRECTION_ENUM, DIRECTION_ORDER_ENUM, PARAMS_NAME_ENUM, SPIKE_COUNT_ENUM, SPIKES_COUNT_MAP_NUMBER_ENUM } from "../../Enums";
import { SubStateMechine } from "../../Base/SubStateMechine";

const BASE_URL = 'texture/spikes/spikesone/'

export default class SpikesOneSubStateMachine extends SubStateMechine{
  constructor(fsm:StateMachine){
    super(fsm)
    this.stateMachines.set(SPIKE_COUNT_ENUM.ZERO,new State(fsm, BASE_URL + 'zero'))
    this.stateMachines.set(SPIKE_COUNT_ENUM.ONE,new State(fsm, BASE_URL + 'one'))
    this.stateMachines.set(SPIKE_COUNT_ENUM.TWO,new State(fsm, BASE_URL + 'two'))
  }

  run(): void {
    const { value: newCount } = this.fsm.params.get(PARAMS_NAME_ENUM.SPIKES_CUR_COUNT)
    this.currentState = this.stateMachines.get(SPIKES_COUNT_MAP_NUMBER_ENUM[newCount as number])
  }
  init(): void {

  }
}
