import { _decorator, Component, Node } from 'cc';
import { TileMapManager } from '../Tile/TileMapManager';
import { createUINode } from '../Utils';
import levels, { ILevel } from '../../Levels';
import DataManager from '../../Runtime/DataManager';
import { TILE_HEIGHT, TILE_WIDTH } from '../Tile/TileManager';
const { ccclass, property } = _decorator;

@ccclass('BattleManager')
export class BattleManager extends Component {
    level:ILevel
    stage:Node

    generateTileMap() {
        this.generateStage()
        this.stage.setParent(this.node)
        const tileMap = new Node()
        tileMap.setParent(this.stage)
        const tileMapManager = tileMap.addComponent(TileMapManager)
        tileMapManager.init()

        this.adaptPos()
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
        this.initLevel()
    }

    initLevel(){
        const level = levels[`level${1}`]
        if (level) {
            this.level = level

            DataManager.Instance.mapInfo = level.mapInfo
            DataManager.Instance.mapRowCount = level.mapInfo.length
            DataManager.Instance.mapColumCount = level.mapInfo[0].length

            this.generateTileMap()
        }
    }

    update(deltaTime: number) {

    }
}


