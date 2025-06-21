import { _decorator, Component, Sprite, UITransform, Animation, animation, AnimationClip, Vec3, SpriteFrame } from "cc";
import { TILE_HEIGHT, TILE_WIDTH } from "../Tile/TileManager";;
import { CONTROLLER_ENUM, DIRECTION_ENUM, DIRECTION_ORDER_ENUM, ENTITY_STATE_ENUM, ENTITY_TYPE_ENUM, EVENT_ENUM, PARAMS_NAME_ENUM } from "../../Enums";
import EventManager from "../../Runtime/EventManager";
import { PlayerStateMachine } from "./PlayerStateMachine";
import { EntityManager } from "../../Base/EntityManager";
import DataManager from "../../Runtime/DataManager";

const { ccclass, property } = _decorator;

@ccclass('PlayerManager')
export class PlayerManager extends EntityManager {
  targetX:number = 0
  targetY:number = 0

  private readonly speed = 1/10

  async init() {

    this.fsm = this.addComponent(PlayerStateMachine)
    await this.fsm.init()
    super.init({
      x:2,
      y:8,
      direction:DIRECTION_ENUM.TOP,
      state:ENTITY_STATE_ENUM.IDLE,
      type:ENTITY_TYPE_ENUM.PLAYER
    })
    this.targetX = this.x
    this.targetY = this.y

    EventManager.Instance.on(EVENT_ENUM.PLAYER_CTRL, this.inputHandle, this)
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

  inputHandle(inputDirection:CONTROLLER_ENUM){
    if (this.willBlock(inputDirection)) {
      return
    }
    this.move(inputDirection)
  }

  move(inputDirection:CONTROLLER_ENUM){
    if (inputDirection === CONTROLLER_ENUM.TOP) {
      this.targetY -= 1
    } else if (inputDirection === CONTROLLER_ENUM.BOTTOM) {
      this.targetY += 1
    } else if (inputDirection === CONTROLLER_ENUM.LEFT) {
      this.targetX -= 1
    } else if(inputDirection === CONTROLLER_ENUM.RIGHT){
      this.targetX += 1
    } else if (inputDirection === CONTROLLER_ENUM.TURNLEFT) {
      if (this.direction === DIRECTION_ENUM.TOP) {
        this.direction = DIRECTION_ENUM.LEFT
      } else if (this.direction === DIRECTION_ENUM.LEFT) {
        this.direction = DIRECTION_ENUM.BOTTOM
      } else if (this.direction === DIRECTION_ENUM.BOTTOM) {
        this.direction = DIRECTION_ENUM.RIGHT
      } else if (this.direction === DIRECTION_ENUM.RIGHT) {
        this.direction = DIRECTION_ENUM.TOP
      }
      this.state = ENTITY_STATE_ENUM.TURNLEFT
    }
  }

  willBlock(inputDirection: CONTROLLER_ENUM){
    const {targetX:x, targetY:y, direction} = this
    const {tileInfo} = DataManager.Instance

    if (inputDirection === CONTROLLER_ENUM.TOP) {
      if (direction === DIRECTION_ENUM.TOP) {
        const playerNextX = y-1
        const weaponNextY = y-2
        if (playerNextX < 0) {
          return true
        }
        const playerTile = tileInfo[x][playerNextX]
        const weaponTile = tileInfo[x][weaponNextY]
        if(playerTile && playerTile.moveable && (!weaponTile || weaponTile.turnable)){
          // empty
        } else{
          return true
        }
      }
    } else if (inputDirection === CONTROLLER_ENUM.TURNLEFT) {
      let nextX
      let nextY
      if (direction === DIRECTION_ENUM.TOP) {
        nextX = x-1
        nextY = y-1
      } else if (direction === DIRECTION_ENUM.BOTTOM) {
        nextX = x+1
        nextY = y+1
      } else if (direction === DIRECTION_ENUM.LEFT) {
        nextX = x-1
        nextY = y+1
      } else if (direction === DIRECTION_ENUM.RIGHT) {
        nextX = x+1
        nextY = y-1
      }
      if ((!tileInfo[x][nextY]|| tileInfo[x][nextY].turnable) && (!tileInfo[nextX][y] || tileInfo[nextX][y].turnable) && (!tileInfo[nextX][nextY] || tileInfo[nextX][nextY].turnable)) {
        // empty
      } else {
        return true
      }
    }
    return false

  }

  update(dt:number){
    this.updateXY()
    super.update(dt)
  }
}
