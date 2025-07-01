import { _decorator, Component, director, Node } from 'cc';
import FaderManager from '../../Runtime/FaderManager';
const { ccclass, property } = _decorator;

@ccclass('StartManager')
export class StartManager extends Component {

    protected onLoad(): void {
      FaderManager.Instance.fadeOut(1000)
      this.node.once(Node.EventType.TOUCH_END, this.handleStart, this)
    }

    async handleStart(){
      await FaderManager.Instance.fadeIn(300)
      director.loadScene('Battle')
    }
}


