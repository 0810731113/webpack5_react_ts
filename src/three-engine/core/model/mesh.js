import * as THREE from 'three'
import Entity from './entity';
import { entityTypes } from './entitytypes';

class Mesh extends Entity {
    constructor() {
        super(entityTypes.Mesh);
        this._data = undefined;
    }

    get data() {
        return this._data;
    }

    set data(p) {
        this._data = p;
    }

    getPnts() {
        let meshVertices = this.data.vertices;
        let meshVertexCnt = meshVertices.length / 3;
        let meshPnts = [];
        for (let vIdx = 0; vIdx < meshVertexCnt; ++vIdx) {
            meshPnts.push(new THREE.Vector3(meshVertices[3 * vIdx], meshVertices[3 * vIdx + 1], meshVertices[3 * vIdx + 2]));
        }

        return meshPnts;
    }

    getBBox() {
        let bBox = new THREE.Box3();
        bBox.setFromPoints(this.getPnts());

        return bBox;
    }

    assign(source) {
        super.assign(source);

        this._data = JSON.parse(JSON.stringify(source._data));
    }

    copy() {
        const inst = new Mesh();
        inst.assign(this);

        return inst;
    }

    serializedData() {
        let obj = super.serializedData();
        return Object.assign(obj, {
            data: this._data
        });
    }

    serializedMetaData() {
        return {
            className: 'Mesh',
            schemaVersion: 0
        };
    }

    deserialize(data, metaData) {
        super.deserialize(data, metaData);
        this._data = data.data;
    }

    static make() {
        let mesh = new Mesh();
        return mesh;
    }
}

export { Mesh }