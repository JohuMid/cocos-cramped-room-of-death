import { DIRECTION_ENUM, DIRECTION_ORDER_ENUM, PARAMS_NAME_ENUM, SPIKE_COUNT_ENUM, SPIKES_COUNT_MAP_NUMBER_ENUM } from "../../Enums";
import { SubStateMechine } from "../../Base/SubStateMechine";

const BASE_URL = 'texture/spikes/spikestwo/'

export default class SpikesSubStateMachine extends SubStateMechine{
  run(): void {
    const { value: newCount } = this.fsm.params.get(PARAMS_NAME_ENUM.SPIKES_CUR_COUNT)
    this.currentState = this.stateMachines.get(SPIKES_COUNT_MAP_NUMBER_ENUM[newCount as number])
  }
  init(): void {

  }
}
