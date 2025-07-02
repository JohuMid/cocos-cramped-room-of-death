import { _decorator, Component, director, Node, ProgressBar, resources } from 'cc';
import { SCENE_ENUM } from '../../Enums';
const { ccclass, property } = _decorator;

@ccclass('LoadingManager')
export class LoadingManager extends Component {
  @property(ProgressBar)
  bar:ProgressBar = null
    protected onLoad(): void {
      resources.preloadDir('texture/ctrl',(cue,total)=>{
        this.bar.progress = cue/total
      },()=>{
        director.loadScene(SCENE_ENUM.Start)
      })
    }
}


