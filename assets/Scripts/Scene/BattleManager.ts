import { _decorator, Component, director, Node } from 'cc';
import { TileMapManager } from '../Tile/TileMapManager';
import { createUINode } from '../Utils';
import levels, { ILevel } from '../../Levels';
import DataManager, { IRecord } from '../../Runtime/DataManager';
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
import FaderManager from '../../Runtime/FaderManager';
import { ShakeManager } from '../UI/ShakeManager';
const { ccclass, property } = _decorator;

@ccclass('BattleManager')
export class BattleManager extends Component {
    level:ILevel
    stage:Node
    private smokeLayer:Node
    private inited = false

    protected onLoad(): void {
        DataManager.Instance.levelIndex = 1
        EventManager.Instance.on(EVENT_ENUM.NEXT_LEVEL, this.nextLevel, this)
        EventManager.Instance.on(EVENT_ENUM.PLAYER_MOVE_END, this.checkArrived, this)
        EventManager.Instance.on(EVENT_ENUM.SHOW_SMOKE, this.generateSmoke, this)
        EventManager.Instance.on(EVENT_ENUM.RECORD_STEP, this.record, this)
        EventManager.Instance.on(EVENT_ENUM.REVOKE_STEP, this.revoke, this)
        EventManager.Instance.on(EVENT_ENUM.RESTART_LEVEL, this.initLevel, this)
        EventManager.Instance.on(EVENT_ENUM.OUT_BATTLE, this.outBattle, this)
    }

    protected onDestroy(): void {
        EventManager.Instance.off(EVENT_ENUM.NEXT_LEVEL, this.nextLevel)
        EventManager.Instance.off(EVENT_ENUM.PLAYER_MOVE_END, this.checkArrived)
        EventManager.Instance.off(EVENT_ENUM.SHOW_SMOKE, this.generateSmoke)
        EventManager.Instance.off(EVENT_ENUM.RECORD_STEP, this.record)
        EventManager.Instance.off(EVENT_ENUM.REVOKE_STEP, this.revoke)
        EventManager.Instance.off(EVENT_ENUM.RESTART_LEVEL, this.initLevel)
        EventManager.Instance.off(EVENT_ENUM.OUT_BATTLE, this.outBattle)
    }

    generateStage(){
        this.stage = createUINode()
        this.stage.setParent(this.node)
        this.stage.addComponent(ShakeManager)
    }

    adaptPos(){
        const {mapRowCount, mapColumCount} = DataManager.Instance
        const disX = TILE_WIDTH * mapColumCount/2
        const disY = TILE_HEIGHT * mapRowCount/2
        this.stage.getComponent(ShakeManager).stop()
        this.stage.setPosition(-disX,disY + 80)
    }

    start() {
        this.generateStage()
        this.initLevel()
    }

    async initLevel(){
        const level = levels[`level${DataManager.Instance.levelIndex}`]
        if (level) {
            if (this.inited) {
                await FaderManager.Instance.fadeIn()
            } else {
                await FaderManager.Instance.mask()
            }


            this.clearLevel()
            this.level = level

            DataManager.Instance.mapInfo = level.mapInfo
            DataManager.Instance.mapRowCount = level.mapInfo.length
            DataManager.Instance.mapColumCount = level.mapInfo[0].length

            await Promise.all([
                this.generateTileMap(),
                this.generateDoor(),
                this.generateBurst(),
                this.generateSpikes(),
                this.generateSmokeLayer(),
                this.generateEnemies(),
                this.generatePlayer(),
            ])

            await FaderManager.Instance.fadeOut()
            this.inited = true
        } else {
            EventManager.Instance.emit(EVENT_ENUM.OUT_BATTLE)
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

    async generateSmokeLayer(){
        this.smokeLayer = createUINode()
        this.smokeLayer.setParent(this.stage)
    }

    async outBattle(){
        await FaderManager.Instance.fadeIn()
        director.loadScene('Start')
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

    record(){
        const item:IRecord = {
            player:{
                x:DataManager.Instance.player.x,
                y:DataManager.Instance.player.y,
                direction:DataManager.Instance.player.direction,
                state:(DataManager.Instance.player.state === ENTITY_STATE_ENUM.IDLE ||
                    DataManager.Instance.player.state === ENTITY_STATE_ENUM.DEATH ||
                    DataManager.Instance.player.state === ENTITY_STATE_ENUM.AIRDEATH)?
                    DataManager.Instance.player.state:ENTITY_STATE_ENUM.IDLE,
                type:DataManager.Instance.player.type,
            },
            door:{
                x: DataManager.Instance.door.x,
                y: DataManager.Instance.door.y,
                state: DataManager.Instance.door.state,
                type: DataManager.Instance.door.type,
                direction: DIRECTION_ENUM.TOP
            },
            enemies:DataManager.Instance.enemies.map(({x,y,direction,state,type})=>({
                x,
                y,
                direction,
                state,
                type,
            })),
            bursts:DataManager.Instance.bursts.map(({x,y,direction,state,type})=>({
                x,
                y,
                direction,
                state,
                type,
            })),
            spikes:DataManager.Instance.spikes.map(({x,y,count,type})=>({
                x,
                y,
                count,
                type,
            }))
        }
        DataManager.Instance.records.push(item)
    }

    revoke(){
        const item = DataManager.Instance.records.pop()
        if (item) {
            DataManager.Instance.player.x = DataManager.Instance.player.targetX = item.player.x
            DataManager.Instance.player.y = DataManager.Instance.player.targetY = item.player.y
            DataManager.Instance.player.direction = item.player.direction
            DataManager.Instance.player.state = item.player.state
            DataManager.Instance.player.type = item.player.type

            DataManager.Instance.door.x = item.door.x
            DataManager.Instance.door.y = item.door.y
            DataManager.Instance.door.direction = item.door.direction
            DataManager.Instance.door.state = item.door.state
            DataManager.Instance.door.type = item.door.type

            DataManager.Instance.enemies.forEach((enemy,index)=>{
                enemy.x = item.enemies[index].x
                enemy.y = item.enemies[index].y
                enemy.direction = item.enemies[index].direction
                enemy.state = item.enemies[index].state
                enemy.type = item.enemies[index].type
            })

            DataManager.Instance.bursts.forEach((burst,index)=>{
                burst.x = item.bursts[index].x
                burst.y = item.bursts[index].y
                burst.direction = item.bursts[index].direction
                burst.state = item.bursts[index].state
                burst.type = item.bursts[index].type
            })

            DataManager.Instance.spikes.forEach((spike,index)=>{
                spike.x = item.spikes[index].x
                spike.y = item.spikes[index].y
                spike.count = item.spikes[index].count
                spike.type = item.spikes[index].type
            })
        }
    }

    update(deltaTime: number) {

    }
}


