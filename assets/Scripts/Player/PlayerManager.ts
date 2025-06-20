import { _decorator, Component, Sprite, UITransform, Animation, animation, AnimationClip, Vec3, SpriteFrame } from "cc";
import { TILE_HEIGHT, TILE_WIDTH } from "../Tile/TileManager";
import ResourceManager from "../../Runtime/ResourceManager";
import { CONTROLLER_ENUM, EVENT_ENUM } from "../../Enums";
import EventManager from "../../Runtime/EventManager";

const { ccclass, property } = _decorator;

const ANIMATION_SPEED = 1/8

@ccclass('PlayerManager')
export class PlayerManager extends Component {
  x:number = 0
  y:number = 0
  targetX:number = 0
  targetY:number = 0

  private readonly speed = 1/10

  async init() {
    this.render()

    EventManager.Instance.on(EVENT_ENUM.PLAYER_CTRL, this.move, this)
  }

  updateXY(){
    if (this.targetX<this.x) {
      this.x -= this.speed
    } else if (this.targetX>this.x) {
      this.x += this.speed
    }

    if (this.targetY<this.y) {
      this.y -= this.speed
    } else if (this.targetY>this.y) {
      this.y += this.speed
    }

    if (Math.abs(this.targetX - this.x) < this.speed) {
      this.x = this.targetX
    }

    if (Math.abs(this.targetY - this.y) < this.speed) {
      this.y = this.targetY
    }
  }

  move(inputDirection:CONTROLLER_ENUM){
    if (inputDirection === CONTROLLER_ENUM.TOP) {
      this.targetY -= 1
    } else if (inputDirection === CONTROLLER_ENUM.BOTTOM) {
      this.targetY += 1
    } else if (inputDirection === CONTROLLER_ENUM.LEFT) {
      this.targetX -= 1
    } else if (inputDirection === CONTROLLER_ENUM.RIGHT) {
      this.targetX += 1
    }
  }

  async render(){
    const sprite = this.addComponent(Sprite)
    sprite.sizeMode = Sprite.SizeMode.CUSTOM

    const transForm = this.getComponent(UITransform)
    transForm.setContentSize(TILE_WIDTH * 4,TILE_HEIGHT * 4)

    const spriteFrames = await ResourceManager.Instance.loadDir('texture/player/idle/top')

    const animationComponent = this.addComponent(Animation)

    const animationClip = new AnimationClip();

    const track  = new animation.ObjectTrack(); // 创建一个对象轨道
    track.path = new animation.TrackPath().toComponent(Sprite).toProperty('spriteFrame'); // 指定轨道路径
    const frames :Array<[number,SpriteFrame]> = spriteFrames.map((item,index)=>[ANIMATION_SPEED * index, item])

    track.channel.curve.assignSorted(frames)

    // 动画剪辑添加轨道
    animationClip.addTrack(track);

    animationClip.duration = frames.length * ANIMATION_SPEED

    animationClip.wrapMode = AnimationClip.WrapMode.Loop
    animationComponent.defaultClip = animationClip

    animationComponent.play()
  }

  update(dt:number){
    this.updateXY()
    this.node.setPosition(this.x * TILE_WIDTH - TILE_WIDTH * 1.5, -this.y * TILE_HEIGHT + TILE_HEIGHT * 1.5)
  }
}
