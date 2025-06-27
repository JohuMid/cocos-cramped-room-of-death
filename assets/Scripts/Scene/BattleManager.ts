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
import { BurstManager } from '../Burst/BurstManager';
import { SpikesManager } from '../Spikes/SpikesManager';
import { EnemyManager } from '../../Base/EnemyManager';
import { SmokeManager } from '../Smoke/SmokeManager';
const { ccclass, property } = _decorator;

@ccclass('BattleManager')
export class BattleManager extends Component {
    level:ILevel
    stage:Node
    private smokeLayer:Node
    protected onLoad(): void {
        DataManager.Instance.levelIndex = 1
        EventManager.Instance.on(EVENT_ENUM.NEXT_LEVEL, this.nextLevel, this)
        EventManager.Instance.on(EVENT_ENUM.PLAYER_MOVE_END, this.checkArrived, this)
        EventManager.Instance.on(EVENT_ENUM.SHOW_SMOKE, this.generateSmoke, this)
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
            this.generateBurst()
            this.generateSpikes()
            this.generateSmokeLayer()
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
        await doorManager.init(this.level.door)
        DataManager.Instance.door = doorManager
    }

    async generatePlayer(){
        const player = createUINode()
        player.setParent(this.stage)
        const playerManager = player.addComponent(PlayerManager)
        await playerManager.init(this.level.player)
        DataManager.Instance.player = playerManager
        EventManager.Instance.emit(EVENT_ENUM.PLAYER_BORN,true)
    }

    async generateBurst(){
        const promise = []
        for (let i = 0; i < this.level.bursts.length; i++) {
            const burst = this.level.bursts[i];
            const node = createUINode()
            node.setParent(this.stage)
            const manager = node.addComponent(BurstManager)
            promise.push(await manager.init(burst))
            DataManager.Instance.bursts.push(manager)
        }
        await Promise.all(promise)
    }

    async generateSpikes(){
        const promise = []
        for (let i = 0; i < this.level.spikes.length; i++) {
            const spikes = this.level.spikes[i];
            const node = createUINode()
            node.setParent(this.stage)
            const manager = node.addComponent(SpikesManager)
            promise.push(await manager.init(spikes))
            DataManager.Instance.spikes.push(manager)
        }
        await Promise.all(promise)
    }

    async generateEnemies(){
        DataManager.Instance.enemies = []
        const promises = []
        for (let i = 0; i < this.level.enemies.length; i++) {
        const enemy = this.level.enemies[i]
        const node = createUINode()
        node.setParent(this.stage)
        let manager: EnemyManager;
        if (enemy.type === ENTITY_TYPE_ENUM.SKELETON_WOODEN) {
            manager = node.addComponent(WoodenSkeletonManager);
        } else {
            manager = node.addComponent(IronSkeletonManager);
        }
        promises.push(manager.init(enemy))
        DataManager.Instance.enemies.push(manager)
        }

        await Promise.all(promises)
    }

    async generateSmoke(x:number,y:number,direction:DIRECTION_ENUM){
        const item = DataManager.Instance.smokes.find(smoke=>smoke.state === ENTITY_STATE_ENUM.DEATH)
        if (item) {
            item.x = x
            item.y = y
            item.direction = direction
            item.state = ENTITY_STATE_ENUM.IDLE
            item.node.setPosition(x * TILE_WIDTH - TILE_WIDTH * 1.5, -y * TILE_HEIGHT + TILE_HEIGHT * 1.5)
        } else{
            const smoke = createUINode()
            smoke.setParent(this.smokeLayer)
            const smokeManager = smoke.addComponent(SmokeManager)
            await smokeManager.init({
                x,
                y,
                direction,
                state:ENTITY_STATE_ENUM.IDLE,
                type:ENTITY_TYPE_ENUM.SMOKE
            })
            DataManager.Instance.smokes.push(smokeManager)
        }
    }

    generateSmokeLayer(){
        this.smokeLayer = createUINode()
        this.smokeLayer.setParent(this.stage)
    }


    nextLevel(){
        DataManager.Instance.levelIndex++
        this.initLevel()
    }

    checkArrived(){
        if (!DataManager.Instance.player || !DataManager.Instance.door) {
            return
        }
        const {x:playerX, y:playerY} = DataManager.Instance.player
        const {x:doorX, y:doorY, state:doorState} = DataManager.Instance.door
        if (playerX === doorX && playerY === doorY && doorState === ENTITY_STATE_ENUM.DEATH) {
            EventManager.Instance.emit(EVENT_ENUM.NEXT_LEVEL)

        }
    }

    clearLevel(){
        this.stage.destroyAllChildren()
        DataManager.Instance.reset()
    }

    update(deltaTime: number) {

    }
}


