import { Viewable } from './viewable';

class Mesh extends Viewable {
    constructor(scene, context, entity) {
        super(scene, context, entity);
    }

    createSceneNode() {
        if (!this._entity) {
            return;
        }
        let mesh = this.drawTool.createMesh(this._entity.data);
        if(mesh) {
            this._node.add(mesh);
        }
    }
}

export { Mesh }