import * as THREE from 'three'
import { Application } from 'three-engine/core/application';

class AxisDim extends THREE.Object3D {
    constructor(viewer, pl, host, start, end) {
        super();
        this._viewer = viewer;
        this._pl = pl;
        this._host = host;
        this._start = start;
        this._end = end;
        this._data = {};
        this._mtx = null;
        this._angle = 0;
    }

    updateMatrixWorld() {
        super.updateMatrixWorld();
        let s = this._viewer.pixelLength() / this._pl;
        let v = this._data;
        v.node.scale.setScalar(s * v.size);
        let p0 = v.start.clone();
        let p1 = v.end.clone();
        let pos = this._calcTextPosition(p0, p1, s);
        v.node.position.copy(pos);
        this._host.onUpdate(pos);
    } 

    draw(p0, p1) {
        let v = new THREE.Vector3();
        v.subVectors(p1, p0);
        let dist = v.length();
        dist = dist.toFixed(0);
        let text = dist.toString();
        let size = 6;
        let font = Application.instance().font;
        let node = this._host.drawTool.createTextMesh(font, text, size, 0xff0000);
        node.visible = false;
        let dir = new THREE.Vector3(1, 0, 0);
        if (p0.distanceTo(p1) > 0) {
            dir = new THREE.Vector3().subVectors(p1, p0);
        }
        dir.normalize();
        let start = new THREE.Vector3(1, 0, 0);
        let end = dir.clone();
        let normal = new THREE.Vector3();
        normal.copy(start).cross(end);
        let axis = new THREE.Vector3(0, 0, 1);
        let angle = start.angleTo(end) * (normal.dot(axis) < 0 ? -1 : 1);
        if (angle < 0) {
            angle = Math.PI * 2 + angle;
        }
        if (angle > Math.PI / 2 && angle <= Math.PI * 3 / 2) {
            angle -= Math.PI;
        }
        let quat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), angle);
        node.quaternion.copy(quat);
        this.add(node);
        this._data.node = node;
        this._data.size = size;
        this._data.start = p0;
        this._data.end = p1;
        let q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), dir);
        this._mtx = new THREE.Matrix4().compose(p0.clone(), q, new THREE.Vector3(1, 1, 1));
        this._angle = angle;
    }

    _calcTextPosition(p0, p1, scale) {
        let ps = p0;
        let pe = p1;
        if (this._mtx) {
            const h = ((this._angle > 0.1) ? 300 : 120) * scale;
            const l = p0.distanceTo(p1);
            ps = new THREE.Vector3(0, h, 0);
            pe = new THREE.Vector3(l, h, 0);
            ps.applyMatrix4(this._mtx);
            pe.applyMatrix4(this._mtx);
        }   
        return new THREE.Vector3((ps.x + pe.x) * 0.5, (ps.y + pe.y) * 0.5, 0);
    }
}

export { AxisDim }