import { _decorator, Color, Component, Graphics, Node, view, game } from 'cc';
const { ccclass, property } = _decorator;

const {width:SCREEN_WIDTH,height:SCREEN_HEIGHT} = view.getVisibleSize()

enum FADE_STATE_ENUM{
  IDLE="IDLE",
  FADE_IN="FADE_IN",
  FADE_OUT="FADE_OUT",
}

export const DEFAULT_DURATION = 2000

@ccclass('DrawManager')
export class DrawManager extends Component {
  private ctx:Graphics
  private state:FADE_STATE_ENUM = FADE_STATE_ENUM.IDLE
  private oldTime:number = 0
  private durtion:number = 0
  private fadeResolve:(value:PromiseLike<null>)=>void

  init(){
    this.ctx = this.getComponent(Graphics)

    this.setAlpha(1)
  }

  setAlpha(percent:number){
    this.ctx.clear()
    this.ctx.rect(0,0,SCREEN_WIDTH,SCREEN_HEIGHT)
    this.ctx.fillColor = new Color(0,0,0,255*percent)
    this.ctx.fill()
  }

  protected update(dt: number): void {
    const percent = (game.totalTime - this.oldTime) / DEFAULT_DURATION
    switch (this.state) {
      case FADE_STATE_ENUM.FADE_IN:
        if (percent<1) {
          this.setAlpha(percent)
        } else {
          this.setAlpha(1)
          this.state = FADE_STATE_ENUM.IDLE
        }
        break;
      case FADE_STATE_ENUM.FADE_OUT:
        if (percent<1) {
          this.setAlpha(1-percent)
        } else {
          this.setAlpha(0)
          this.state = FADE_STATE_ENUM.IDLE
        }
        break;
    }
  }

  fadeIn(duration = DEFAULT_DURATION){
    this.setAlpha(0)
    this.durtion = duration
    this.oldTime = game.totalTime
    this.state = FADE_STATE_ENUM.FADE_IN
    return new Promise((resolve)=>{
      this.fadeResolve = resolve
    })
  }

  fadeOut(duration = DEFAULT_DURATION){
    this.setAlpha(1)
    this.durtion = duration
    this.oldTime = game.totalTime
    this.state = FADE_STATE_ENUM.FADE_OUT
    return new Promise((resolve)=>{
      this.fadeResolve = resolve
    })
  }
}


