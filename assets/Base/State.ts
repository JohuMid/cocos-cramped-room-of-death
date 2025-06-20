/*
需要知道animationClip
需要播放动画的能力animation
*/

import { animation, AnimationClip, Sprite, SpriteFrame } from "cc";
import { PlayerStateMachine } from "../Scripts/Player/PlayerStateMachine";
import ResourceManager from "../Runtime/ResourceManager";

const ANIMATION_SPEED = 1/8

export default class State{
  private animationClip:AnimationClip

  constructor(private fsm:PlayerStateMachine,private path:string,private warpMode = AnimationClip.WrapMode.Normal){
    this.init()
  }

  async init(){
    const promise = ResourceManager.Instance.loadDir(this.path)
    this.fsm.waitingList.push(promise)
    const spriteFrames = await promise

    this.animationClip = new AnimationClip();

    const track  = new animation.ObjectTrack(); // 创建一个对象轨道
    track.path = new animation.TrackPath().toComponent(Sprite).toProperty('spriteFrame'); // 指定轨道路径
    const frames :Array<[number,SpriteFrame]> = spriteFrames.map((item,index)=>[ANIMATION_SPEED * index, item])

    track.channel.curve.assignSorted(frames)

    // 动画剪辑添加轨道
    this.animationClip.addTrack(track);

    this.animationClip.duration = frames.length * ANIMATION_SPEED

    this.animationClip.wrapMode = this.warpMode

  }
  run(){
    this.fsm.animationComponent.defaultClip = this.animationClip
    this.fsm.animationComponent.play()
  }
}
