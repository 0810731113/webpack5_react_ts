import Entity from '../entity';
import { entityTypes } from '../entitytypes';
import DisplayLevel from '../displaylevel';
import { DirtyType } from '../../display/dirtytype';
import { FaceTypes } from './facetypes';
import { MeshData } from '../meshData';
import { Face } from './face';
import { Edge } from './edge';

class Body extends Entity {
    constructor() {
        super(entityTypes.Body);
        this._faces = [];
        this._meshData = null;
        this._displayLevel = DisplayLevel.Face;
    }

    get displayLevel() {
        return this._displayLevel;
    }

    set displayLevel(p) {
        this._displayLevel = p;
    }

    get faces() {
        return this._faces;
    }

    set faces(p) {
        this._faces = p;
    }

    build(data, excludeEdges = false) {
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
        if (this.faces && this.faces.length > 0) {
            let faces = meshData.faces;
            const existingFaces = this.faces.slice(0);
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
                    this.addFace(face);
                }

                if (!excludeEdges) {
                    itr.edges.forEach(itr => {
                        let edge = new Edge();
                        edge.meshData = new MeshData(itr);
                        face.addEdge(edge);
                    });
                }
                idx++;
            });

            if (existingFaces.length > 0) {
                existingFaces.forEach(face => {
                    let faceIdx = this.faces.indexOf(face);
                    if (faceIdx !== -1) {
                        this.faces.splice(faceIdx, 1);
                    }
                });
            }
        } else {
            let idx = 0;
            let faces = meshData.faces;
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
                this.addFace(face);
                idx++;
            });
        }
        this.dirty = DirtyType.All;
    }

    static getFaceType(meshData, idx) {
        let e = FaceTypes.Side;
        let tfs = meshData.topFaces;
        let bfs = meshData.bottomFaces;
        if (!tfs || !bfs) {
            return e;
        }
        if (tfs.indexOf(idx) != -1) {
            e = FaceTypes.Top;
        } else if (bfs.indexOf(idx) != -1) {
            e = FaceTypes.Bottom;
        }
        return e;
    }

    getFaces(e) {
        let arr = [];
        this._faces.forEach(itr => {
            if (itr.faceType == e) {
                arr.push(itr);
            }
        });
        return arr;
    }

    getBBox() {
        return this.meshData.getBBox();
    }

    addFace(face) {
        this._faces.push(face);
    }

    delFace(face) {
        if (!face) {
            return;
        }
        let idx = this._faces.indexOf(face);
        if (idx > -1) {
            this._faces.splice(idx, 1);
        }
    }

    clear() {
        this._faces = [];
        this._meshData = null;
        this.dirty = DirtyType.All;
    }

    lookupFace(id) {
        let target = null;
        for (let i = 0; i < this._faces.length; i++) {
            let face = this._faces[i];
            if (face.id == id) {
                target = face;
                break;
            }
        }
        return target;
    }

    get meshData() {
        return this._meshData;
    }

    set meshData(p) {
        this._meshData = p;
    }
}

export { Body }