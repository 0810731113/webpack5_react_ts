'use strict';

import * as THREE from 'three';
import { Edge } from '../brep/edge';
import { Mesh } from '../mesh';
import { MeshData } from '../meshData';
import { CurvePolygon } from '../../math/geom/curvepolygon';
import { Body } from '../brep/body';
import { ProjectPlane } from '../../math/geom/projectplane';

class PolygonMesh {
    constructor(curvePolyWithHoles) {
        this._cph = curvePolyWithHoles;
    }

    static genEdgeMeshDatas(cphs) {
        let edges = [];
        cphs.forEach(cph => {
            cph.curves.forEach(curve => {
                let edge = PolygonMesh.genEdgeMeshData(curve);
                edges.push(edge);
            });
        });
        
        return edges;
    }

    static genEdgeMeshData(curve) {
        let meshData = new MeshData();
        let curvePnts = CurvePolygon.convCurve2Pnts(curve);
        curvePnts.forEach(curvePnt => {
            meshData.addVertex(curvePnt);
        });

        return meshData;
    }

    static genFaceMeshWithCphs(cphs) {

    }
    static genFaceMesh(cph) {

    }

    static genMeshDataWithCphs(cphs, originPnt) {
        let uvOrigin = originPnt || new THREE.Vector3(0, 0, 0);
        let meshData = new MeshData();
        cphs.forEach(cph => {
            let polygon = cph.conv2Polygon();
            let {pnts, triangles} = polygon.triangulation();
            let normal = polygon.normal;
            let projectPlane = new ProjectPlane(uvOrigin, normal);
            let triangleIndex = meshData.getVertexLength();
            pnts.forEach(pnt => {
                meshData.addVertex(pnt);
                meshData.addNormal(normal);
                meshData.addUV(projectPlane.projectPnt(pnt));
            });
            meshData.appendTriangles(triangles, triangleIndex);
        });

        return meshData;
    }
    static genBodyMesh(cph) {
        
    }
}

export {PolygonMesh}