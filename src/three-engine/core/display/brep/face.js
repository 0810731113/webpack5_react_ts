import { Viewable } from '../viewable';

class Face extends Viewable {
    constructor(scene, context, entity) {
        super(scene, context, entity);
    }

    get mesh() {
        return this._mesh;
    }
    
    createSceneNode(ignoreMaterial = false) {
        if (!this._entity.vis) {
            return;
        }
        this._mesh = this.drawTool.createMesh(this._entity.meshData);
        this._node.add(this._mesh);
        this._node.tag = this._entity.id;
        if (!this._entity.material || ignoreMaterial) {
            return;
        }
        this.assignMaterial(this._mesh, this._entity.material);
    }

    overrideMaterial(materialData) {
        if (this._entity.material) {
            const newMaterial = materialData ? this._entity.material.clone() : this._entity.material;
            for (const key in materialData) {
                newMaterial[key] = materialData[key];
            }
            this.assignMaterial(this._mesh, newMaterial);
        }
    }
}

export { Face }