import * as THREE from 'three'
import { SnapManager } from '../manager';
import { EndPointSnap2d } from '../elements/endpoint';
import { HorzSnap2d } from '../elements/horz';
import { VertSnap2d } from '../elements/vert';
import { SnapData } from '../data';
import { Application } from 'three-engine/core/application';
import { CrossSnap2d } from '../elements/cross';
import { FootPointSnap2d } from '../elements/footpoint';

class AxisLineSnapManager extends SnapManager {
    constructor() {
        super();
        this._viewer = null;
    }

    setup(viewer, base, isOrtho) {
        this._snaps = [];
        let lines = [];
        let grid = Application.instance().axisGrid;
        let ents = grid.entities;
        ents.forEach(itr => {
            let s = itr.start;
            let e = itr.end;
            let v1 = new THREE.Vector3(s.x, s.y, s.z);
            let v2 = new THREE.Vector3(e.x, e.y, e.z);
            let mtx = itr.mtxLocal;
            v1.applyMatrix4(mtx);
            v2.applyMatrix4(mtx);
            let line = new THREE.Line3(v1, v2);
            lines.push(line);
        });
        this._viewer = viewer;
        this._data = SnapData.setFromLines(lines);
        this._data.base = base;
        this._data.isOrtho = isOrtho;
        let arr = [new EndPointSnap2d(), new HorzSnap2d(), new VertSnap2d(), new CrossSnap2d()];
        arr.forEach(itr => {
            itr.data = this._data;
            this._snaps.push(itr);
        });
    }

    snap(pos) {
        return super.work(pos);
    }
}

export { AxisLineSnapManager }
