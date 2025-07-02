import { _decorator, Color, Component, Graphics, Node, view, game, BlockInputEvents, UITransform } from 'cc';
const { ccclass, property } = _decorator;

const {width:SCREEN_WIDTH,height:SCREEN_HEIGHT} = view.getVisibleSize()

enum FADE_STATE_ENUM{
  IDLE="IDLE",
  FADE_IN="FADE_IN",
  FADE_OUT="FADE_OUT",
}

export const DEFAULT_DURATION = 200

@ccclass('DrawManager')
export class DrawManager extends Component {
  private ctx:Graphics
  private state:FADE_STATE_ENUM = FADE_STATE_ENUM.IDLE
  private oldTime:number = 0
  private durtion:number = 0
  private fadeResolve:(value:PromiseLike<null>)=>void
  private block:BlockInputEvents

  init(){
    this.block = this.addComponent(BlockInputEvents)
    this.ctx = this.addComponent(Graphics)
    const transForm = this.getComponent(UITransform)
    transForm.setAnchorPoint(0.5,0.5)
    transForm.setContentSize(SCREEN_WIDTH *2,SCREEN_HEIGHT*2)

    this.setAlpha(1)
  }

  setAlpha(percent:number){
    this.ctx.clear()
    this.ctx.rect(0,0,SCREEN_WIDTH *2,SCREEN_HEIGHT*2)
    this.ctx.fillColor = new Color(0,0,0,255*percent)
    this.ctx.fill()
    this.block.enabled = percent === 1
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
          this.fadeResolve(null)
        }
        break;
      case FADE_STATE_ENUM.FADE_OUT:
        if (percent<1) {
          this.setAlpha(1-percent)
        } else {
          this.setAlpha(0)
          this.state = FADE_STATE_ENUM.IDLE
          this.fadeResolve(null)
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

  mask(){
    this.setAlpha(1)
    return new Promise((resolve)=>{
      setTimeout(resolve, DEFAULT_DURATION)
    })
  }
}


