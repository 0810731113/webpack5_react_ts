'use strict';

import * as THREE from 'three'

class EdgeHelper{
    constructor(edge){
        this._edge = edge;

        // TODO: edge mesh local matrix
        let edgeMeshDataVertices = edge.meshData.vertices;
        this._edgeStart = new THREE.Vector3(edgeMeshDataVertices[0], edgeMeshDataVertices[1], edgeMeshDataVertices[2]);
        this._edgeEnd = new THREE.Vector3(edgeMeshDataVertices[3], edgeMeshDataVertices[4], edgeMeshDataVertices[5]);

        this._edgeDir = new THREE.Vector3().subVectors(this._edgeEnd, this._edgeStart);
        this._edgeDir.normalize();
    }

    get edgeStart(){
        return this._edgeStart;
    }
    get edgeEnd(){
        return this._edgeEnd;
    }
    get edgeDir(){
        return this._edgeDir;
    }
}

export {EdgeHelper}