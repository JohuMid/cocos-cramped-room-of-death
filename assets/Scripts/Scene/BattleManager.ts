import { _decorator, Component, Node } from 'cc';
import { TileMapManager } from '../Tile/TileMapManager';
import { createUINode } from '../Utils';
import levels, { ILevel } from '../../Levels';
import DataManager from '../../Runtime/DataManager';
import { TILE_HEIGHT, TILE_WIDTH } from '../Tile/TileManager';
import EventManager from '../../Runtime/EventManager';
import { DIRECTION_ENUM, ENTITY_STATE_ENUM, ENTITY_TYPE_ENUM, EVENT_ENUM } from '../../Enums';
import { PlayerManager } from '../Player/PlayerManager';
import { WoodenSkeletonManager } from '../WoodenSkeleton/WoodenSkeletonManager';
import { DoorManager } from '../Door/DoorManager';
import { IronSkeletonManager } from '../IronSkeleton/IronSkeletonManager';
const { ccclass, property } = _decorator;

@ccclass('BattleManager')
export class BattleManager extends Component {
    level:ILevel
    stage:Node
    protected onLoad(): void {
        EventManager.Instance.on(EVENT_ENUM.NEXT_LEVEL, this.nextLevel, this)
    }

    protected onDestroy(): void {
        EventManager.Instance.off(EVENT_ENUM.NEXT_LEVEL, this.nextLevel)
    }

    generateStage(){
        this.stage = createUINode()
        this.stage.setParent(this.node)
    }

    adaptPos(){
        const {mapRowCount, mapColumCount} = DataManager.Instance
        const disX = TILE_WIDTH * mapColumCount/2
        const disY = TILE_HEIGHT * mapRowCount/2

        this.stage.setPosition(-disX,disY + 80)
    }

    start() {
        this.generateStage()
        this.initLevel()
    }

    initLevel(){
        const level = levels[`level${DataManager.Instance.levelIndex}`]
        if (level) {
            this.clearLevel()
            this.level = level

            DataManager.Instance.mapInfo = level.mapInfo
            DataManager.Instance.mapRowCount = level.mapInfo.length
            DataManager.Instance.mapColumCount = level.mapInfo[0].length

            this.generateTileMap()
            this.generateDoor()
            this.generateEnemies()
            this.generatePlayer()

        }
    }

    async generateTileMap() {
        this.stage.setParent(this.node)
        const tileMap = new Node()
        tileMap.setParent(this.stage)
        const tileMapManager = tileMap.addComponent(TileMapManager)
        await tileMapManager.init()

        this.adaptPos()
    }

    async generateDoor(){
        const door = createUINode()
        door.setParent(this.stage)
        const doorManager = door.addComponent(DoorManager)
        await doorManager.init()
        DataManager.Instance.door = doorManager
    }

    async generatePlayer(){
        const player = createUINode()
        player.setParent(this.stage)
        const playerManager = player.addComponent(PlayerManager)
        await playerManager.init(
            {
                x:2,
                y:8,
                direction:DIRECTION_ENUM.TOP,
                state:ENTITY_STATE_ENUM.IDLE,
                type:ENTITY_TYPE_ENUM.PLAYER
            }
        )
        DataManager.Instance.player = playerManager
        EventManager.Instance.emit(EVENT_ENUM.PLAYER_BORN,true)
    }

    async generateEnemies(){
        const enemy1 = createUINode()
        enemy1.setParent(this.stage)
        const enemyManager1 = enemy1.addComponent(WoodenSkeletonManager)
        await enemyManager1.init({
            x:2,
            y:5,
            direction:DIRECTION_ENUM.TOP,
            state:ENTITY_STATE_ENUM.IDLE,
            type:ENTITY_TYPE_ENUM.SKELETON_WOODEN
        })
        DataManager.Instance.enemies.push(enemyManager1)


        const enemy2 = createUINode()
        enemy2.setParent(this.stage)
        const enemyManager2 = enemy2.addComponent(IronSkeletonManager)
        await enemyManager2.init({
            x:2,
            y:2,
            direction:DIRECTION_ENUM.TOP,
            state:ENTITY_STATE_ENUM.IDLE,
            type:ENTITY_TYPE_ENUM.SKELETON_IRON
        })
        DataManager.Instance.enemies.push(enemyManager2)
    }

    nextLevel(){
        DataManager.Instance.levelIndex++
        this.initLevel()
    }

    clearLevel(){
        this.stage.destroyAllChildren()
        DataManager.Instance.reset()
    }

    update(deltaTime: number) {

    }
}


