import { Viewable } from '../viewable';
import DisplayLevel from '../../model/displaylevel';
import { Face } from './face';

class Body extends Viewable {
    constructor(scene, context, entity) {
        super(scene, context, entity);
        this.faces = [];
    }

    createSceneNode(ignoreMaterial = false) {
        let level = this._entity.displayLevel;
        if (!level) {
            level = DisplayLevel.Body;
        }
        switch (level) {
            case DisplayLevel.Body:
                {
                    let mesh = this.drawTool.createMesh(this._entity.meshData);
                    this._node.add(mesh);
                    if (this._entity.material && !ignoreMaterial) {
                        const meshes = this._getMeshes(this._node);
                        const enablePolygonOffset = this.enablePolygonOffset ? true: false;
                        meshes.forEach(item => {
                            item.enablePolygonOffset = enablePolygonOffset;
                            this.assignMaterial(item, this._entity.material);
                        });
                    }
                }
                break;
            case DisplayLevel.Face:
                {
                    let ents = this._entity.faces;
                    this.faces = [];
                    ents.forEach(itr => {
                        let face = new Face(this._scene, this._context, itr);
                        face.createSceneNode();
                        this._node.add(face.node);
                        this.faces.push(face);
                        const mat = itr.material ? itr.material : this._entity.material;
                        if (mat && !ignoreMaterial) {
                            const meshes = this._getMeshes(face.node);
                            meshes.forEach(item => {
                                this.assignMaterial(item, mat);
                            });
                        }
                    });
                }
                break;
        }
    }

    overrideMaterial(materialData) {
        let level = this._entity.displayLevel;
        if (!level) {
            level = DisplayLevel.Body;
        }
        switch (level) {
            case DisplayLevel.Body:
                {
                    if (this._entity.material) {
                        const meshes = this._getMeshes(this._node);
                        const enablePolygonOffset = this.enablePolygonOffset ? true: false;
                        const newMaterial = materialData ? this._entity.material.clone() : this._entity.material;
                        for (const key in materialData) {
                            newMaterial[key] = materialData[key];
                        }
                        meshes.forEach(item => {
                            item.enablePolygonOffset = enablePolygonOffset;
                            this.assignMaterial(item, newMaterial);
                        });
                    }
                }
                break;
            case DisplayLevel.Face:
                {
                    let newBodyMaterial;
                    if (this._entity.material) {
                        newBodyMaterial = this._entity.material.clone();
                        for (const key in materialData) {
                            newBodyMaterial[key] = materialData[key];
                        }
                    }

                    this.faces.forEach(itr => {
                        const ent = itr.entity;
                        let newFaceMaterial;
                        if (ent.material) {
                            newFaceMaterial = ent.material.clone();
                            for (const key in materialData) {
                                newFaceMaterial[key] = materialData[key];
                            }                            
                        }
                        const newMaterial = newFaceMaterial ? newFaceMaterial : newBodyMaterial;
                        if (newMaterial) {
                            const meshes = this._getMeshes(itr.node);
                            meshes.forEach(item => {
                                this.assignMaterial(item, newMaterial);
                            });
                        }
                    });
                }
                break;
        }       
    }
}

export { Body }