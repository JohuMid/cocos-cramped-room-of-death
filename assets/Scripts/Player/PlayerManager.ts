import { _decorator, Component, Sprite, UITransform, Animation, animation, AnimationClip, Vec3, SpriteFrame, log } from "cc";
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
  isMoving:boolean = false

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
    EventManager.Instance.on(EVENT_ENUM.ATTACK_PLAYER, this.onDead, this)
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

    if (Math.abs(this.targetX - this.x) < this.speed && Math.abs(this.targetY - this.y) < this.speed && this.isMoving) {
      this.isMoving = false
      this.x = this.targetX
      this.y = this.targetY
      EventManager.Instance.emit(EVENT_ENUM.PLAYER_MOVE_END)
    }
  }

  onDead(state:ENTITY_STATE_ENUM){
    if (state === ENTITY_STATE_ENUM.DEATH) {
      this.state = ENTITY_STATE_ENUM.DEATH
    }
  }

  inputHandle(inputDirection:CONTROLLER_ENUM){
    if (this.isMoving) {
      return
    }
    if (this.state === ENTITY_STATE_ENUM.DEATH || this.state === ENTITY_STATE_ENUM.AIRDEATH || this.state === ENTITY_STATE_ENUM.ATTACK) {
      return
    }

    const id = this.willAttack(inputDirection)
    if (id) {
      EventManager.Instance.emit(EVENT_ENUM.ATTACK_ENEMY,id)
      return
    }
    if (this.willBlock(inputDirection)) {
      return
    }
    this.move(inputDirection)
  }

  move(inputDirection:CONTROLLER_ENUM){
    this.isMoving = true
    if (inputDirection === CONTROLLER_ENUM.TOP) {
      this.targetY -= 1
      this.isMoving = true
    } else if (inputDirection === CONTROLLER_ENUM.BOTTOM) {
      this.targetY += 1
      this.isMoving = true
    } else if (inputDirection === CONTROLLER_ENUM.LEFT) {
      this.targetX -= 1
      this.isMoving = true
    } else if(inputDirection === CONTROLLER_ENUM.RIGHT){
      this.targetX += 1
      this.isMoving = true
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
      EventManager.Instance.emit(EVENT_ENUM.PLAYER_MOVE_END)
      this.state = ENTITY_STATE_ENUM.TURNLEFT
    } else if (inputDirection === CONTROLLER_ENUM.TURNRIGHT) {
      if (this.direction === DIRECTION_ENUM.TOP) {
        this.direction = DIRECTION_ENUM.RIGHT
      } else if (this.direction === DIRECTION_ENUM.RIGHT) {
        this.direction = DIRECTION_ENUM.BOTTOM
      } else if (this.direction === DIRECTION_ENUM.BOTTOM) {
        this.direction = DIRECTION_ENUM.LEFT
      } else if (this.direction === DIRECTION_ENUM.LEFT) {
        this.direction = DIRECTION_ENUM.TOP
      }
      this.state = ENTITY_STATE_ENUM.TURNRIGHT
    }
  }

  willAttack(type: CONTROLLER_ENUM){
    const enemies = DataManager.Instance.enemies.filter(enemy =>enemy.state!==ENTITY_STATE_ENUM.DEATH)
    for (let i = 0; i < enemies.length; i++) {
      const {x:enemyX,y:enemyY,id:enemyId} = enemies[i];
      if (type === CONTROLLER_ENUM.TOP && this.direction === DIRECTION_ENUM.TOP
        && enemyX ===this.x
        && enemyY === this.targetY-2)
      {
        this.state = ENTITY_STATE_ENUM.ATTACK
        return enemyId
      } else if (type === CONTROLLER_ENUM.LEFT && this.direction === DIRECTION_ENUM.LEFT
        && enemyX ===this.x-2
        && enemyY === this.targetY)
      {
        this.state = ENTITY_STATE_ENUM.ATTACK
        return enemyId
      } else if (type === CONTROLLER_ENUM.BOTTOM && this.direction === DIRECTION_ENUM.BOTTOM
        && enemyX ===this.x
        && enemyY === this.targetY+2)
      {
        this.state = ENTITY_STATE_ENUM.ATTACK
        return enemyId
      } else if (type === CONTROLLER_ENUM.RIGHT && this.direction === DIRECTION_ENUM.RIGHT
        && enemyX ===this.x+2
        && enemyY === this.targetY)
      {
        this.state = ENTITY_STATE_ENUM.ATTACK
        return enemyId
      }
    }
    return ''
  }

  willBlock(inputDirection: CONTROLLER_ENUM){
    const {targetX:x, targetY:y, direction} = this
    const {tileInfo} = DataManager.Instance

    const column = 9
    const row = 10

    if (inputDirection === CONTROLLER_ENUM.TOP) {
      const playerNextY = y - 1

      //玩家方向——向上
      if (direction === DIRECTION_ENUM.TOP) {
        //判断是否超出地图
        if (playerNextY < 0) {
          this.state = ENTITY_STATE_ENUM.BLOCKFRONT
          return true
        }

        const weaponNextY = y - 2
        const nextPlayerTile = tileInfo[x]?.[playerNextY]
        const nextWeaponTile = tileInfo[x]?.[weaponNextY]

        //最后判断地图元素
        if (nextPlayerTile && nextPlayerTile.moveable && (!nextWeaponTile || nextWeaponTile.turnable)) {
          // empty
        } else {
          this.state = ENTITY_STATE_ENUM.BLOCKFRONT
          return true
        }

        //玩家方向——向下
      } else if (direction === DIRECTION_ENUM.BOTTOM) {
        //判断是否超出地图
        if (playerNextY < 0) {
          this.state = ENTITY_STATE_ENUM.BLOCKBACK
          return true
        }

        const weaponNextY = y
        const nextPlayerTile = tileInfo[x]?.[playerNextY]
        const nextWeaponTile = tileInfo[x]?.[weaponNextY]

        //最后判断地图元素
        if (nextPlayerTile && nextPlayerTile.moveable && (!nextWeaponTile || nextWeaponTile.turnable)) {
          // empty
        } else {
          this.state = ENTITY_STATE_ENUM.BLOCKBACK
          return true
        }

        //玩家方向——向左
      } else if (direction === DIRECTION_ENUM.LEFT) {
        //判断是否超出地图
        if (playerNextY < 0) {
          this.state = ENTITY_STATE_ENUM.BLOCKRIGHT
          return true
        }

        const weaponNextX = x - 1
        const weaponNextY = y - 1
        const nextPlayerTile = tileInfo[x]?.[playerNextY]
        const nextWeaponTile = tileInfo[weaponNextX]?.[weaponNextY]

        //最后判断地图元素
        if (nextPlayerTile && nextPlayerTile.moveable && (!nextWeaponTile || nextWeaponTile.turnable)) {
          // empty
        } else {
          this.state = ENTITY_STATE_ENUM.BLOCKRIGHT
          return true
        }

        //玩家方向——向右
      } else if (direction === DIRECTION_ENUM.RIGHT) {
        //判断是否超出地图
        if (playerNextY < 0) {
          this.state = ENTITY_STATE_ENUM.BLOCKLEFT
          return true
        }

        const weaponNextX = x + 1
        const weaponNextY = y - 1
        const nextPlayerTile = tileInfo[x]?.[playerNextY]
        const nextWeaponTile = tileInfo[weaponNextX]?.[weaponNextY]

        //最后判断地图元素
        if (nextPlayerTile && nextPlayerTile.moveable && (!nextWeaponTile || nextWeaponTile.turnable)) {
          // empty
        } else {
          this.state = ENTITY_STATE_ENUM.BLOCKLEFT
          return true
        }
      }

      //按钮方向——向下
    } else if (inputDirection === CONTROLLER_ENUM.BOTTOM){
      const playerNextY = y + 1

      //玩家方向——向上
      if (direction === DIRECTION_ENUM.TOP) {
        if (playerNextY > column - 1) {
          this.state = ENTITY_STATE_ENUM.BLOCKBACK

          return true
        }

        const weaponNextY = y
        const nextPlayerTile = tileInfo[x]?.[playerNextY]
        const nextWeaponTile = tileInfo[x]?.[weaponNextY]

        //最后判断地图元素
        if (nextPlayerTile && nextPlayerTile.moveable && (!nextWeaponTile || nextWeaponTile.turnable)) {
          // empty
        } else {
          this.state = ENTITY_STATE_ENUM.BLOCKBACK
          return true
        }
        //玩家方向——向下
      } else if (direction === DIRECTION_ENUM.BOTTOM) {
        if (playerNextY > column - 1) {
          this.state = ENTITY_STATE_ENUM.BLOCKFRONT

          return true
        }

        const weaponNextY = y + 2
        const nextPlayerTile = tileInfo[x]?.[playerNextY]
        const nextWeaponTile = tileInfo[x]?.[weaponNextY]

        //最后判断地图元素
        if (nextPlayerTile && nextPlayerTile.moveable && (!nextWeaponTile || nextWeaponTile.turnable)) {
          // empty
        } else {
          this.state = ENTITY_STATE_ENUM.BLOCKFRONT
          return true
        }
        //玩家方向——向左
      } else if (direction === DIRECTION_ENUM.LEFT) {
        if (playerNextY > column - 1) {
          this.state = ENTITY_STATE_ENUM.BLOCKLEFT

          return true
        }

        const weaponNextX = x - 1
        const weaponNextY = y + 1
        const nextPlayerTile = tileInfo[x]?.[playerNextY]
        const nextWeaponTile = tileInfo[weaponNextX]?.[weaponNextY]

        //最后判断地图元素
        if (nextPlayerTile && nextPlayerTile.moveable && (!nextWeaponTile || nextWeaponTile.turnable)) {
          // empty
        } else {
          this.state = ENTITY_STATE_ENUM.BLOCKLEFT
          return true
        }

        //玩家方向——向右
      } else if (direction === DIRECTION_ENUM.RIGHT) {
        if (playerNextY > column - 1) {
          this.state = ENTITY_STATE_ENUM.BLOCKRIGHT

          return true
        }

        const weaponNextX = x + 1
        const weaponNextY = y + 1
        const nextPlayerTile = tileInfo[x]?.[playerNextY]
        const nextWeaponTile = tileInfo[weaponNextX]?.[weaponNextY]

        //最后判断地图元素
        if (nextPlayerTile && nextPlayerTile.moveable && (!nextWeaponTile || nextWeaponTile.turnable)) {
          // empty
        } else {
          this.state = ENTITY_STATE_ENUM.BLOCKRIGHT
          return true
        }
      }
    } else if (inputDirection === CONTROLLER_ENUM.LEFT) {
      const playerNextX = x - 1

      //玩家方向——向上
      if (direction === DIRECTION_ENUM.TOP) {
        //判断是否超出地图
        if (playerNextX < 0) {
          this.state = ENTITY_STATE_ENUM.BLOCKLEFT

          return true
        }

        const weaponNextX = x - 1
        const weaponNextY = y - 1
        const nextPlayerTile = tileInfo[playerNextX]?.[y]
        const nextWeaponTile = tileInfo[weaponNextX]?.[weaponNextY]

        //最后判断地图元素
        if (nextPlayerTile && nextPlayerTile.moveable && (!nextWeaponTile || nextWeaponTile.turnable)) {
          // empty
        } else {
          this.state = ENTITY_STATE_ENUM.BLOCKLEFT
          return true
        }

        //玩家方向——向下
      } else if (direction === DIRECTION_ENUM.BOTTOM) {
        //判断是否超出地图
        if (playerNextX < 0) {
          this.state = ENTITY_STATE_ENUM.BLOCKRIGHT

          return true
        }

        const weaponNextX = x - 1
        const weaponNextY = y + 1
        const nextPlayerTile = tileInfo[playerNextX]?.[y]
        const nextWeaponTile = tileInfo[weaponNextX]?.[weaponNextY]

        //最后判断地图元素
        if (nextPlayerTile && nextPlayerTile.moveable && (!nextWeaponTile || nextWeaponTile.turnable)) {
          // empty
        } else {
          this.state = ENTITY_STATE_ENUM.BLOCKRIGHT
          return true
        }

        //玩家方向——向左
      } else if (direction === DIRECTION_ENUM.LEFT) {
        //判断是否超出地图
        if (playerNextX < 0) {
          this.state = ENTITY_STATE_ENUM.BLOCKFRONT

          return true
        }

        const weaponNextX = x - 2
        const nextPlayerTile = tileInfo[playerNextX]?.[y]
        const nextWeaponTile = tileInfo[weaponNextX]?.[y]

        //最后判断地图元素
        if (nextPlayerTile && nextPlayerTile.moveable && (!nextWeaponTile || nextWeaponTile.turnable)) {
          // empty
        } else {
          this.state = ENTITY_STATE_ENUM.BLOCKFRONT
          return true
        }

        //玩家方向——向右
      } else if (direction === DIRECTION_ENUM.RIGHT) {
        //判断是否超出地图
        if (playerNextX < 0) {
          this.state = ENTITY_STATE_ENUM.BLOCKBACK

          return true
        }

        const weaponNextX = x
        const nextPlayerTile = tileInfo[playerNextX]?.[y]
        const nextWeaponTile = tileInfo[weaponNextX]?.[y]

        //最后判断地图元素
        if (nextPlayerTile && nextPlayerTile.moveable && (!nextWeaponTile || nextWeaponTile.turnable)) {
          // empty
        } else {
          this.state = ENTITY_STATE_ENUM.BLOCKBACK
          return true
        }
      }

      //按钮方向——向右
    } else if (inputDirection === CONTROLLER_ENUM.RIGHT) {
      const playerNextX = x + 1

      //玩家方向——向上
      if (direction === DIRECTION_ENUM.TOP) {
        if (playerNextX > row - 1) {
          this.state = ENTITY_STATE_ENUM.BLOCKRIGHT

          return true
        }

        const weaponNextX = x + 1
        const weaponNextY = y - 1
        const nextPlayerTile = tileInfo[playerNextX]?.[y]
        const nextWeaponTile = tileInfo[weaponNextX]?.[weaponNextY]

        //最后判断地图元素
        if (nextPlayerTile && nextPlayerTile.moveable && (!nextWeaponTile || nextWeaponTile.turnable)) {
          // empty
        } else {
          this.state = ENTITY_STATE_ENUM.BLOCKRIGHT
          return true
        }

        //玩家方向——向下
      } else if (direction === DIRECTION_ENUM.BOTTOM) {
        if (playerNextX > row - 1) {
          this.state = ENTITY_STATE_ENUM.BLOCKLEFT

          return true
        }

        const weaponNextX = x + 1
        const weaponNextY = y + 1
        const nextPlayerTile = tileInfo[playerNextX]?.[y]
        const nextWeaponTile = tileInfo[weaponNextX]?.[weaponNextY]

        //最后判断地图元素
        if (nextPlayerTile && nextPlayerTile.moveable && (!nextWeaponTile || nextWeaponTile.turnable)) {
          // empty
        } else {
          this.state = ENTITY_STATE_ENUM.BLOCKLEFT
          return true
        }

        //玩家方向——向左
      } else if (direction === DIRECTION_ENUM.LEFT) {
        if (playerNextX > row - 1) {
          this.state = ENTITY_STATE_ENUM.BLOCKBACK

          return true
        }

        const weaponNextX = x
        const nextPlayerTile = tileInfo[playerNextX]?.[y]
        const nextWeaponTile = tileInfo[weaponNextX]?.[y]

        //最后判断地图元素
        if (nextPlayerTile && nextPlayerTile.moveable && (!nextWeaponTile || nextWeaponTile.turnable)) {
          // empty
        } else {
          this.state = ENTITY_STATE_ENUM.BLOCKBACK
          return true
        }

        //玩家方向——向右
      } else if (direction === DIRECTION_ENUM.RIGHT) {
        if (playerNextX > row - 1) {
          this.state = ENTITY_STATE_ENUM.BLOCKFRONT

          return true
        }

        const weaponNextX = x + 2
        const nextPlayerTile = tileInfo[playerNextX]?.[y]
        const nextWeaponTile = tileInfo[weaponNextX]?.[y]

        //最后判断地图元素
        if (nextPlayerTile && nextPlayerTile.moveable && (!nextWeaponTile || nextWeaponTile.turnable)) {
          // empty
        } else {
          this.state = ENTITY_STATE_ENUM.BLOCKFRONT
          return true
        }
      }
      //按钮方向——左转
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
        this.state = ENTITY_STATE_ENUM.BLOCKTURNLEFT
        return true
      }
    } else if (inputDirection === CONTROLLER_ENUM.TURNRIGHT) {
      let nextX
      let nextY
      if (direction === DIRECTION_ENUM.TOP) {
        nextX = x+1
        nextY = y-1
      } else if (direction === DIRECTION_ENUM.BOTTOM) {
        nextX = x-1
        nextY = y+1
      } else if (direction === DIRECTION_ENUM.LEFT) {
        nextX = x-1
        nextY = y-1
      } else if (direction === DIRECTION_ENUM.RIGHT) {
        nextX = x+1
        nextY = y+1
      }
      if ((!tileInfo[x][nextY]|| tileInfo[x][nextY].turnable) && (!tileInfo[nextX][y] || tileInfo[nextX][y].turnable) && (!tileInfo[nextX][nextY] || tileInfo[nextX][nextY].turnable)) {
        // empty
      } else {
        this.state = ENTITY_STATE_ENUM.BLOCKTURNRIGHT
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
