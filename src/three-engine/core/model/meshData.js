'use strict';

import * as THREE from 'three'

class MeshData {
    constructor(data) {
        this.vertices = [];
        this.normals = [];
        this.uvs = [];
        this.triangles = [];
        if(data) {
            if(data.vertices) {
                this.vertices = data.vertices;
            }
            if(data.normals) {
                this.normals = data.normals;
            }
            if(data.uvs) {
                this.uvs = data.uvs;
            }
            if(data.triangles) {
                this.triangles = data.triangles;
            }
        }
    }

    addVertex(pnt) {
        this.vertices.push(pnt.x);
        this.vertices.push(pnt.y);
        this.vertices.push(pnt.z);
    }
    addVertexComponent(x, y, z) {
        this.vertices.push(x);
        this.vertices.push(y);
        this.vertices.push(z);
    }
    getVertexLength() {
        return this.vertices.length/3;
    }

    addNormal(normal) {
        this.normals.push(normal.x);
        this.normals.push(normal.y);
        this.normals.push(normal.z);
    }

    addUV(uvData) {
        this.uvs.push(uvData.x);
        this.uvs.push(uvData.y);
    }

    appendTriangles(triangleDatas, vertexIndex) {
        let startVertexIndex = vertexIndex || 0;
        triangleDatas.forEach(triangleData => {
            triangleData.forEach(triangleIndex => {
                let newTriangleIndex = triangleIndex + startVertexIndex;
                this.triangles.push(newTriangleIndex);
            });
        });
    }

    clone() {
        const copy = new MeshData();
        copy.vertices = this.vertices.slice(0);
        copy.normals = this.normals.slice(0);
        copy.uvs = this.uvs.slice(0);
        copy.triangles = this.triangles.slice(0);
        return copy;
    }

    getPnts() {
        let meshVertices = this.vertices;
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
}

export {MeshData}