import { _decorator, Component, Node } from 'cc';
import { TileMapManager } from '../Tile/TileMapManager';
import { createUINode } from '../Utils';
import levels, { ILevel } from '../../Levels';
import DataManager from '../../Runtime/DataManager';
import { TILE_HEIGHT, TILE_WIDTH } from '../Tile/TileManager';
import EventManager from '../../Runtime/EventManager';
import { EVENT_ENUM } from '../../Enums';
import { PlayerManager } from '../Player/PlayerManager';
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
            this.generayePlayer()
        }
    }

    generateTileMap() {
        this.stage.setParent(this.node)
        const tileMap = new Node()
        tileMap.setParent(this.stage)
        const tileMapManager = tileMap.addComponent(TileMapManager)
        tileMapManager.init()

        this.adaptPos()
    }

    generayePlayer(){
        const player = createUINode()
        player.setParent(this.stage)
        const playerManager = player.addComponent(PlayerManager)
        playerManager.init()
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


