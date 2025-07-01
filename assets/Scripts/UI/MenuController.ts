import { _decorator, Component, Node } from 'cc';
import EventManager from '../../Runtime/EventManager';
import { CONTROLLER_ENUM, EVENT_ENUM } from '../../Enums';
const { ccclass, property } = _decorator;

@ccclass('MenuController')
export class MenuController extends Component {

    handleUndo(){
        EventManager.Instance.emit(EVENT_ENUM.REVOKE_STEP)
    }
}


