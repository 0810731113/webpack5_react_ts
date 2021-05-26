
import * as THREE from 'three'
import { AxisLine } from './axisline';
import { EntitySet } from 'three-engine/core/model/entityset';
import { entityTypes } from 'three-engine/core/model/entitytypes';

class AxisGroup extends EntitySet {
    constructor() {
        super(entityTypes.AxisGroup);
        this._dist = 0;
        this._num = 0;
        this._prev = null;
        this._next = null;
        this._len = 0;
    }

    fromJson(js) {
        super.fromJson(js);
        this._dist = js.dist;
        this._num = js.num;
        this._len = js.len;
        this._id = js.id;
        js.arr.forEach(itr => {
            let p = new AxisLine(itr);
            p.fromJson(itr);
            this.addTransient(p);
        });
    }

    toJson() {
        let obj = super.toJson();
        let arr = [];
        this.entities.forEach(itr => {
            arr.push(itr.toJson());
        });
        return Object.assign(obj, {
            dist: this._dist,
            num: this._num,
            len: this._len,
            prev: this._prev ? this._prev.id : null,
            next: this._next ? this._next.id : null,
            arr: arr
        });
    }

    get dist() {
        return this._dist;
    }

    set dist(v) {
        this._dist = v;
    }

    get num() {
        return this._num;
    }

    set num(v) {
        this._num = v;
    }

    get prev() {
        return this._prev;
    }

    set prev(p) {
        this._prev = p;
    }

    get next() {
        return this._next;
    }

    set next(p) {
        this._next = p;
    }

    get sum() {
        return this._num * this._dist;
    }

    get len() {
        return this._len;
    }

    set len(v) {
        this._len = v;
    }

    generateCurves(base, index, isX) {
        this.clearTransient();
        let level = base;
        let idx = index;
        for (let i = 0; i < this._num; i++) {
            level += this._dist;
            let p = new AxisLine();
            if (isX) {
                p.build(new THREE.Vector3(0, level, 0), new THREE.Vector3(1, 0, 0), this._len, 3000, 3000, 1000, this._getYName(idx));
            } else {
                p.build(new THREE.Vector3(level, 0, 0), new THREE.Vector3(0, 1, 0), this._len, 3000, 3000, 1000, this._getXName(idx));
            }
            this.addTransient(p);
            idx++;
        }
        return level;
    }

    _getYName(index) {
        let r = index % 23;
        let s = (index - r) / 23;
        let c = this._getChar(r);
        switch (s) {
            case 0:
                c = c;
                break;
            case 1:
                c = c + c;
                break;
            case 2:
                c = c + c + c;
                break;
            default:
                c = "YYY";
        }
        return c;
    }

    _getXName(index) {
        let v = index + 1;
        return v.toString();
    }

    _getChar(idx) {
        let arr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y'];
        let m = new Map();
        for (let i = 0; i < arr.length; i++) {
            m.set(i, arr[i]);
        }
        return m.get(idx)
    }
}

export { AxisGroup }