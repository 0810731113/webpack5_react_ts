import * as THREE from 'three'
import Entity from './entity';
import { MeshData } from './meshData';
import { Body } from './brep/body';
import { Face } from './brep/face';
import { Edge } from './brep/edge';
import DisplayLevel from './displaylevel';
import { DirtyType } from '../display/dirtytype';


class GbmpEntity extends Entity {
    constructor(type) {
        super(type);
        this._body = null;
        this._displayLevel = DisplayLevel.Body;
    }

    get body() {
        return this._body;
    }

    set body(p) {
        this._body = p;
    }

    get displayLevel() {
        return this._displayLevel;
    }

    set displayLevel(value) {
        this._displayLevel = value;
    }

    buildBody(data, excludeEdges = false) {
        switch (this._displayLevel) {
            case DisplayLevel.Body:
                this._buildBodyLevelModel(data);
                break;
            case DisplayLevel.Face:
                this._buildFaceLevelModel(data, excludeEdges);
                break;
        }
    }

    _buildBodyLevelModel(meshData) {
        if (this._body) {
            this._body.meshData = new MeshData(meshData.body);
        } else {
            let body = new Body();
            body.meshData = new MeshData(meshData.body);
            this._body = body;
        }

        this.dirty = DirtyType.All;
    }

    _buildFaceLevelModel(meshData, excludeEdges = false) {
        if (this._body) {
            let faces = meshData.faces;
            const existingFaces = this._body.faces.slice(0);
            let idx = 0;
            faces.forEach(itr => {
                let faceIdx = existingFaces.findIndex(item => item.tag === itr.tag);
                let face = existingFaces[faceIdx];
                if (face) {
                    face.meshData = new MeshData(itr.mesh);
                    face.faceType = Body.getFaceType(meshData, idx);
                    face.edges = [];
                    existingFaces.splice(faceIdx, 1);
                } else {
                    face = new Face();
                    face.faceType = Body.getFaceType(meshData, idx);
                    face.meshData = new MeshData(itr.mesh);
                    face.tag = itr.tag;
                    this._body.addFace(face);
                }

                if (!excludeEdges) {
                    itr.edges.forEach(itr => {
                        let edge = new Edge();
                        edge.meshData = new MeshData(itr);
                        face.addEdge(edge);
                    });
                }

                idx++;
                face.design = this.design;
            });

            if (existingFaces.length > 0) {
                existingFaces.forEach(face => {
                    let faceIdx = this._body.faces.indexOf(face);
                    if (faceIdx !== -1) {
                        this._body.faces.splice(faceIdx, 1);
                    }
                });
            }
            this._body.stageChange();
        } else {
            let idx = 0;
            let faces = meshData.faces;
            let body = new Body();
            body.displayLevel = this._displayLevel;
            faces.forEach(itr => {
                let face = new Face();
                face.meshData = new MeshData(itr.mesh);
                face.faceType = Body.getFaceType(meshData, idx);
                face.tag = itr.tag;

                if (!excludeEdges) {
                    itr.edges.forEach(itr => {
                        let edge = new Edge();
                        edge.meshData = new MeshData(itr);
                        face.addEdge(edge);
                    });
                }

                body.addFace(face);
                idx++;
            });
            this._body = body;
        }
        this.dirty = DirtyType.All;
    }

    getBBox() {
        let bBox = null;
        switch (this._displayLevel) {
            case DisplayLevel.Body:
                bBox = this._getBodyLevelBBox();
                break;
            case DisplayLevel.Face:
                bBox = this._getFaceLevelBBox();
                break;
        }
        return bBox;
    }

    _getBodyLevelBBox() {
        return this.body.getBBox();
    }

    _getFaceLevelBBox() {
        let points = [];
        this.body.faces.forEach(face => {
            points = points.concat(face.meshData.getPnts());
        });
        let bBox = new THREE.Box3();
        bBox.setFromPoints(points);
        return bBox;
    }
}

export { GbmpEntity }