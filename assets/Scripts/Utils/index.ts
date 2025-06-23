import { Layers,Node, SpriteFrame, UITransform } from "cc"

export const createUINode = (name:string = '') => {
  const node = new Node(name)
  const transform = node.addComponent(UITransform)
  transform.setAnchorPoint(0,1)
  node.layer = 1 << Layers.nameToLayer("UI_2D")
  return node
}

export const randomByRange = (start:number,end:number) => Math.floor(Math.random() * (end - start) + start)

const getNumberWithinString = (str:string) => Number(str.match(reg)?.[1] || '0')

const reg = /\((\d+)\)/
export const sortSpriteFrame = (spriteFrames:SpriteFrame[])=> spriteFrames.sort((a,b)=>getNumberWithinString(a.name) - getNumberWithinString(b.name))
