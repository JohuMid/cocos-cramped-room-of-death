import { _decorator, Component, Sprite, UITransform, Animation, animation, AnimationClip, Vec3, SpriteFrame } from "cc";
import { TILE_HEIGHT, TILE_WIDTH } from "../Tile/TileManager";
import ResourceManager from "../../Runtime/ResourceManager";

const { ccclass, property } = _decorator;

const ANIMATION_SPEED = 1/8

@ccclass('PlayerManager')
export class PlayerManager extends Component {
  async init() {
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

}
