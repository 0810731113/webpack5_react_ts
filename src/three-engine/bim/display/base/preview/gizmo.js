import * as THREE from 'three'
import { gizmoHolder } from './holder';

class ManipulatorGizmo extends THREE.Object3D {
    constructor() {
        super();
        this._gizmo = {};
        this._handler = null;
        this._gap = 0.01;
    }

    get gizmo() {
        return this._gizmo;
    }

    get handler() {
        return this._handler;
    }

    set handler(p) {
        this._handler = p;
    }

    build() {
        this._createGizmo();
    }

    _createGizmo() {
    }

    updateMatrixWorld() {
        THREE.Object3D.prototype.updateMatrixWorld.call(this);
    }

    _createTGizmo() {
        let geo = gizmoHolder.getGeometry('T');
        if (geo) {
            return geo;
        }
        let arrowGeometry = new THREE.CylinderBufferGeometry(0, 0.08, 0.2, 12, 1, false);
        let lineGeometry = new THREE.BufferGeometry();
        lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 0.95, 0, 0], 3));
        let mat = new THREE.MeshBasicMaterial({
            depthTest: false,
            depthWrite: false,
            transparent: true,
            side: THREE.DoubleSide,
            fog: false,
            color: 0xff0000
        });
        let matLine = new THREE.LineBasicMaterial({
            depthTest: false,
            depthWrite: false,
            transparent: true,
            linewidth: 5,
            fog: false,
            color: 0xff0000
        });

        let matZ = mat;
        let matLineZ = matLine;
        let matXY = mat.clone();
        matXY.color.set(0xffffff);
        matXY.opacity = 0.25;
        
        let map = {};
        this._createZ(map, arrowGeometry, lineGeometry, matZ, matLineZ);
        this._createO(map, matXY);
        gizmoHolder.addGeometry('T', map);
        return map;
    }

    _createX(map, goeArrow, geoLine, matArrow, matLine) {
        let gizmos = [];
        let arrow = [];
        let mesh = new THREE.Mesh(goeArrow, matArrow);
        arrow.push(mesh);
        arrow.push([1, 0, 0]);
        arrow.push([0, 0, -Math.PI / 2]);
        arrow.push(null);
        arrow.push('fwd');
        gizmos.push(arrow);

        let line = [];
        line.push(new THREE.Line(geoLine, matLine));
        line.push(null);
        line.push(null);
        line.push(null);
        line.push(null);
        gizmos.push(line);
        map.X = gizmos;
    }

    _createY(map, goeArrow, geoLine, matArrow, matLine) {
        let gizmos = [];
        let arrow = [];
        let mesh = new THREE.Mesh(goeArrow, matArrow);
        arrow.push(mesh);
        arrow.push([0, 1, 0]);
        arrow.push(null);
        arrow.push(null);
        arrow.push('fwd');
        gizmos.push(arrow);

        let line = [];
        line.push(new THREE.Line(geoLine, matLine));
        line.push(null);
        line.push([ 0, 0, Math.PI / 2 ]);
        line.push(null);
        line.push(null);
        gizmos.push(line);
        map.Y = gizmos;
    }

    _createZ(map, goeArrow, geoLine, matArrow, matLine) {
        let gizmos = [];
        let arrow = [];
        let mesh = new THREE.Mesh(goeArrow, matArrow);
        arrow.push(mesh);
        arrow.push([0, 0, 1]);
        arrow.push([Math.PI / 2, 0, 0]);
        arrow.push(null);
        arrow.push('fwd');
        gizmos.push(arrow);

        let line = [];
        line.push(new THREE.Line(geoLine, matLine));
        line.push(null);
        line.push([0, -Math.PI / 2, 0]);
        line.push(null);
        line.push(null);
        gizmos.push(line);
        map.Z = gizmos;
    }

    _createO(map, mat) {
        let gizmos = [];
        let org = [];
        org.push(new THREE.Mesh(new THREE.SphereGeometry(0.08, 64), mat));
        org.push(null);
        org.push(null);
        org.push(null);
        org.push('fwd');
        gizmos.push(org);
        map.XY = gizmos;
    }

    _createRGizmo() {
        let geo = gizmoHolder.getGeometry('R');
        if (geo) {
            return geo;
        }

        let map = {};
        let gizmos = [];
        const r = 0.55;
        const R = 0.65;
        let matInner = new THREE.MeshBasicMaterial({
            depthTest: false,
            depthWrite: false,
            transparent: true,
            side: THREE.DoubleSide,
            fog: false,
            color: 0x0000ff,
            opacity: 1.0
        });
        const s = this._gap;
        let inner = [];
        let meshInner = new THREE.Mesh(new THREE.RingGeometry(r, R, 64, 64, s, (Math.PI / 2 - 2 * s)), matInner);
        inner.push(meshInner);
        inner.push(null);
        inner.push([0, 0, -Math.PI / 2]);
        inner.push(null);
        inner.push('R');
        gizmos.push(inner);

        let outer = [];
        let matOuter = matInner.clone();
        matOuter.color.set(0xffffff);
        matOuter.transparent = false;
        matOuter.opacity = 1;
        let meshOuter = new THREE.Mesh(new THREE.RingGeometry(r - s, R + s, 64, 64, -s, Math.PI / 2 + 2 * s), matOuter);
        meshOuter.renderOrder = 1;
        meshOuter.visible = false;
        outer.push(meshOuter);
        outer.push(null);
        outer.push([0, 0, -Math.PI / 2]);
        outer.push(null);
        outer.push('RR');
        gizmos.push(outer);

        map.RZ = gizmos;
        gizmoHolder.addGeometry('R', map);
        return map;
    }

    _createRRGizmo() {
        let RR = gizmoHolder.getGeometry('RR');
        if (RR) {
            return RR;
        }

        let map = {};
        let gizmos = [];
        const r = 0.55;
        const R = 0.65;
        let matouter = new THREE.MeshBasicMaterial({
            depthTest: false,
            depthWrite: false,
            transparent: true,
            side: THREE.DoubleSide,
            fog: false,
            color: 0x0000ff,
            opacity: 0.2
        });

        const s = this._gap;
        let geo = new THREE.RingGeometry(r, R, 64, 64, Math.PI / 4 + s, (Math.PI / 4 - 2 * s));
        let geoGap = new THREE.RingGeometry(r, R, 64, 64, Math.PI / 4 - s, 2 * s);
        for (let i = 0; i < 8; i++) {
            let outer = [];
            let mat = matouter.clone();
            let meshOuter = new THREE.Mesh(geo, mat);
            meshOuter.translateZ(-0.01);
            outer.push(meshOuter);
            outer.push(null);
            outer.push([0, 0, -Math.PI / 2 + i * Math.PI / 4]);
            outer.push(null);
            outer.push(null);
            gizmos.push(outer);

            let gap = [];
            let matGap = matouter.clone();
            matGap.color.set(0xffffff);
            matGap.opacity = 1.0;
            let meshGap = new THREE.Mesh(geoGap, matGap);
            meshGap.translateZ(-0.01);
            gap.push(meshGap);
            gap.push(null);
            gap.push([0, 0, -Math.PI / 2 + i * Math.PI / 4]);
            gap.push(null);
            gap.push(null);
            gizmos.push(gap);
        }

        map.RR = gizmos;
        gizmoHolder.addGeometry('RR', map);
        return map;
    }

    _setupGizmo(gizmoMap) {
        let gizmo = new THREE.Object3D();
        for (let name in gizmoMap) {
            for (let i = gizmoMap[name].length; i--;) {
                let object = gizmoMap[name][i][0].clone();
                let position = gizmoMap[name][i][1];
                let rotation = gizmoMap[name][i][2];
                let scale = gizmoMap[name][i][3];
                let tag = gizmoMap[name][i][4];
                object.name = name;
                object.tag = tag;
                object.renderOrder = 1;
                if (position) {
                    object.position.set(position[0], position[1], position[2]);
                }
                if (rotation) {
                    object.rotation.set(rotation[0], rotation[1], rotation[2]);
                }
                if (scale) {
                    object.scale.set(scale[0], scale[1], scale[2]);
                }
                gizmo.add(object);
            }
        }
        return gizmo;
    }
}

export { ManipulatorGizmo }