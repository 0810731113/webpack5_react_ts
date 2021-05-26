import { Viewable } from '../viewable';
import * as THREE from 'three'

class Edge extends Viewable {
    constructor(scene, context, entity) {
        super(scene, context, entity);
        this._mesh = null;
    }

    get mesh() {
        return this._mesh;
    }

    createSceneNode() {
        let mat = new THREE.LineBasicMaterial({ color: 0x000099, depthTest: false });
        this._mesh = this.drawTool.createLine(this._entity.meshData, mat);
        this._node.add(this._mesh);
    }
}

export { Edge }