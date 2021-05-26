import * as THREE from 'three'
import { Axis } from './axis';
import { entityTypes } from '../../../core/model/entitytypes';
import Line from '../../../core/model/line';
import Point from '../../../core/model/point';
import { DirtyType } from 'three-engine/core/display/dirtytype';

class AxisLine extends Axis {
    constructor() {
        super(entityTypes.AxisLine);
        this.diameter = 0;
        this._ext = 0;
        this._dir = null;
        this._len = 0;
    }

    get canDel() {
        return true;
    }
    
    get start() {
        return this._curve.startPt;
    }
    set start(p) {
        this._curve.startPt = p;
        this._dirty = DirtyType.All;
    }

    get end() {
        return this._curve.endPt;
    }
    set end(p) {
        this._curve.endPt = p;
        this._dirty = DirtyType.All;
    }

    get dir() {
        return this._dir;
    }

    get mid() {
        let x = this.start.x + this.end.x;
        let y = this.start.y + this.end.y;
        let z = this.start.z + this.end.z;
        return new THREE.Vector3(x / 2, y / 2, z / 2);
    }

    get len() {
        let s = this.start;
        let e = this.end;
        let ps = new THREE.Vector3(s.x, s.y, s.z);
        let pe = new THREE.Vector3(e.x, e.y, e.z);
        return ps.distanceTo(pe);
    }

    adjustPos(pos) {
        let s = this.start;
        let e = this.end;
        let ps = new THREE.Vector3(s.x, s.y, s.z);
        let pe = new THREE.Vector3(e.x, e.y, e.z);

        ps.add(pos);
        pe.add(pos);

        this.start = new Point(ps.x, ps.y, ps.z);
        this.end = new Point(pe.x, pe.y, pe.z);
    }

    fromJson(js) {
        super.fromJson(js);
        this._curve = Line.fromJson(js.curve);

        let start2EndDir = new THREE.Vector3().subVectors(this.curve.endPt.asVector, this.curve.startPt.asVector);
        this._len = start2EndDir.length();
        if (this.curve.endPt.isEqualTo(this.curve.startPt)){
            if (js.dir !== null && js.dir !== undefined)
            {
                let jsDir = new THREE.Vector3(js.dir.x, js.dir.y, js.dir.z);
                if (jsDir.length() > 0)
                {
                    this._dir = jsDir;
                    this._dir.normalize();
                }
                else
                {
                    this._dir = new THREE.Vector3(1, 0, 0);
                }
            }
            else
            {
                this._dir = new THREE.Vector3(1, 0, 0);
            }
        }
        else{
            this._dir = start2EndDir;
            this._dir.normalize();
        }
    }

    toJson() {
        let obj = super.toJson();
        return Object.assign(obj, {
            dir: { x: this._dir.x, y: this._dir.y, z: this._dir.z },
            len: this._len
        });
    }

    build(start, dir, len, startExt, endExt, dia, name) {
        let s = new THREE.Vector3(start.x, start.y, start.z);
        let e = new THREE.Vector3().addVectors(s, dir.clone().multiplyScalar(len));
        this._curve = new Line(new Point(s.x, s.y, s.z), new Point(e.x, e.y, e.z));
        this._startExt = startExt;
        this._endExt = endExt;
        this.diameter = dia;
        this._name = name;
        this._dir = dir;
        this._len = len;
    }

    buildFrom2Points(p1, p2) {
        let s = p1;
        let e = p2;
        this._curve = new Line(new Point(s.x, s.y, s.z), new Point(e.x, e.y, e.z));
        this._startExt = 3000;
        this._endExt = 3000;
        this.diameter = 1000;
        this._name = '';
        this._len = p1.distanceTo(p2);
        this._dir = this._len > 0 ? new THREE.Vector3().subVectors(p2, p1).normalize() : new THREE.Vector3(1, 0, 0);
    }
}

export { AxisLine }