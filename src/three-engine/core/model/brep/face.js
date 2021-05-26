import * as THREE from 'three'
import Entity from '../entity';
import { entityTypes } from '../entitytypes';
import { FaceTypes } from './facetypes';
import { MeshData } from '../../../core/model/meshData'

class Face extends Entity {
    constructor() {
        super(entityTypes.Face);
        this._edges = [];
        this._meshData = new MeshData();
        this._tag = null;
        this._materialId = undefined;
        this._material = undefined;
        this._faceType = null;
        this._regionPlane = null;
    }

    get regionPlane(){
        return this._regionPlane;
    }
    
    set regionPlane(r){
        this._regionPlane = r;
    }

    get faceType() {
        return this._faceType;
    }

    set faceType(p) {
        this._faceType = p;
    }

    get meshData() {
        return this._meshData;
    }

    set meshData(p) {
        this._meshData = p;
    }

    get tag() {
        return this._tag;
    }

    set tag(t) {
        this._tag = t;
    }

    get edges() {
        return this._edges;
    }

    set edges(p) {
        this._edges = p;
    }

    get material() {
        return null;
    }

    set material(m) {
        if(!m){
            this._material = null;
            this._materialId = null;
            return;
        }
        this._material = m;
        this._materialId = m.id;
    }

    set materialId(mId) {
        if (this._materialId != mId) {
            this._materialId = mId;
            this._material = null;
        }
    }

    get materialId() {
        return this._materialId;
    }

    addEdge(edge) {
        this._edges.push(edge);
    }

    delEdge(edge) {
        this._edges.splice(this._edges.length - 1, 1);
    }

    getBBox() {
        return this.meshData.getBBox();
    }

    getPlaneNormal() {
        return new THREE.Vector3(this.meshData.normals[0], this.meshData.normals[1], this.meshData.normals[2]);
    }

    reverseNormal(){
        this.mesh.data.normals = this.mesh.data.normals.map(data => data * -1);
    }

    setTranslation(transDir) {
        let faceVertexCnt = this.meshData.vertices.length / 3;
        for (let fVIdx = 0; fVIdx < faceVertexCnt; ++fVIdx) {
            this.meshData.vertices[3 * fVIdx] += transDir.x;
            this.meshData.vertices[3 * fVIdx + 1] += transDir.y;
            this.meshData.vertices[3 * fVIdx + 2] += transDir.z;
        }
        this.edges.forEach(edgeOfFace => {
            let edgeVertexCnt = edgeOfFace.meshData.vertices.length / 3;
            for (let eVIdx = 0; eVIdx < edgeVertexCnt; ++eVIdx) {
                edgeOfFace.meshData.vertices[3 * eVIdx] += transDir.x;
                edgeOfFace.meshData.vertices[3 * eVIdx + 1] += transDir.y;
                edgeOfFace.meshData.vertices[3 * eVIdx + 2] += transDir.z;
            }
        });
        this.stageChange();
    }

    stageChange() {
        if (this._edges) {
            this._edges.forEach(itr => {
                if(itr) {
                    itr.stageChange();
                }
            });
        }
        super.stageChange();
    }

    assign(source) {
        super.assign(source);

        this._edges = [];
        if (source._edges) {
            source._edges.forEach(edge => {
                this._edges.push(edge.copy());
            });
        }

        this._meshData = source._meshData ? source._meshData.clone() : null;
        this._tag = source._tag;
        this._materialId = source._materialId;
        this._material = source._material;
        this._faceType = source._faceType;
    }

    copy() {
        const inst = new Face();
        inst.assign(this);

        return inst;
    }

    serializedData() {
        let obj = super.serializedData();
        return Object.assign(obj, {
            meshData: this._meshData,
            tag: this._tag,
            edges: this._edges,
            materialId: this._materialId,
            faceType: this._faceType,
            regionPlane: this._regionPlane
        });
    }

    serializedMetaData() {
        return {
            className: 'Face',
            schemaVersion: 1
        };
    }

    onLinkedEntities() {
        let arr = super.onLinkedEntities();
        this._edges.forEach( (edge) => {
            if(edge) {
                arr.push(edge);
            }
        })
        return arr;
    }

    onFixLink(entityMap) {
        super.onFixLink(entityMap);
        if (this._edges) {
            let edges = this._edges;
            this._edges = [];
            edges.forEach(itr => {
                let edge = entityMap.get(itr);
                if(edge) {
                    this._edges.push(edge);
                }
            })
        }
        //Handle the legacy data(schemaVersion is 0)
        if(this._mesh) {
            this._mesh = entityMap.get(this._mesh);
            if(this._mesh && this._mesh.data) {
                this._meshData = new MeshData(this._mesh.data);
            }
            this._mesh = null;
        }
        if(this._regionPlane){
            this._regionPlane = entityMap.get(this._regionPlane);
        }
    }

    deserialize(data, metaData) {
        super.deserialize(data, metaData);
        this._tag = data.tag;
        this._edges = data.edges;
        this._materialId = data.materialId;
        this._faceType = data.faceType ? data.faceType : FaceTypes.Side;
        this._regionPlane = data.regionPlane;
        switch(metaData.schemaVersion) {
            case 0:
                this._mesh = data.mesh;
                this.migrate();
                break;
            case 1:
            default:
                this._meshData = new MeshData(data.meshData);
        }
    }

    static make() {
        let face = new Face();
        return face;
    }
}

export { Face }