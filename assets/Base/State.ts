/*
需要知道animationClip
需要播放动画的能力animation
*/

import { animation, AnimationClip, Sprite, SpriteFrame } from "cc";
import ResourceManager from "../Runtime/ResourceManager";
import { StateMachine } from "./StateMachine";
import { sortSpriteFrame } from "../Scripts/Utils";

export const ANIMATION_SPEED = 1/8

export default class State{
  private animationClip:AnimationClip

  constructor(
    private fsm:StateMachine,
    private path:string,
    private warpMode = AnimationClip.WrapMode.Normal,
    private speed = ANIMATION_SPEED,
    private events:any[] = []
  ){
    this.init()
  }

  async init(){
    const promise = ResourceManager.Instance.loadDir(this.path)
    this.fsm.waitingList.push(promise)
    const spriteFrames = await promise

    this.animationClip = new AnimationClip();

    const track  = new animation.ObjectTrack(); // 创建一个对象轨道
    track.path = new animation.TrackPath().toComponent(Sprite).toProperty('spriteFrame'); // 指定轨道路径
    const frames :Array<[number,SpriteFrame]> = sortSpriteFrame(spriteFrames).map((item,index)=>[this.speed * index, item])

    track.channel.curve.assignSorted(frames)

    // 动画剪辑添加轨道
    this.animationClip.addTrack(track);
    this.animationClip.name = this.path
    this.animationClip.duration = frames.length * this.speed
    this.animationClip.wrapMode = this.warpMode

    this.events.forEach(event=>{
      this.animationClip.events.push(event)
    })
    this.animationClip.updateEventDatas()
  }
  run(){
    if (this.fsm.animationComponent.defaultClip?.name === this.animationClip?.name) {
      return
    }
    this.fsm.animationComponent.defaultClip = this.animationClip
    this.fsm.animationComponent.play()
  }
}
