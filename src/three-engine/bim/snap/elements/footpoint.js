import * as THREE from 'three'
import { Element2d } from './element';
import { SnapTypes } from '../type';

class FootPointSnap2d extends Element2d {
    constructor() {
        super();
        this._type = SnapTypes.FootPoint;
        this._priority = 1;
    }

    snap(pos) {
        this._snappedPoint = null;
        let MINDIST = this.MINDIST;
        let ls = this._data.ls;
        let base = this._data.base;
        if (!base) {
            return null;
        }
        pos = this._calcProjectionPoint(base, pos);
        
        let line = null;
        ls.forEach(itr => {
            let ptSnap = itr.closestPointToPoint(pos, true, new THREE.Vector3());
            let dist = pos.distanceTo(ptSnap);
            dist = this._toPixel(dist);
            if (dist < MINDIST) {
                MINDIST = dist;
                line = itr;
            }
        });

        if (line) {
            let v1 = line.start.clone().sub(line.end.clone()).normalize();
            let v2 = pos.clone().sub(base.clone()).normalize();
            if (Math.abs(Math.abs(v1.dot(v2))) < 0.03) {
                let ptSnap = line.closestPointToPoint(base, true, new THREE.Vector3());
                if (this._isValidOrthoSnapping(ptSnap.clone(), pos)) {
                    this._snappedPoint = ptSnap;
                }
            }
        }
    
        return (null != this._snappedPoint);
    }

    _calcProjectionPoint(base, pos) {
        let v = pos.clone();
        let x = v.x - base.x;
        let y = v.y - base.y;
        if (Math.abs(x) < Math.abs(y)) {
            v.x = base.x;
        } else {
            v.y = base.y;
        }
        return v;
    }

    _snap(pos) {
        this._snappedPoint = null;
        let MINDIST = this.MINDIST * 3;
        let ls = this._data.ls;
        let base = this._data.base;
        if (!base) {
            return null;
        }
        let line = null;
        ls.forEach(itr => {
            let ptSnap = itr.closestPointToPoint(pos, true, new THREE.Vector3());
            let dist = pos.distanceTo(ptSnap);
            dist = this._toPixel(dist);
            if (dist < MINDIST) {
                MINDIST = dist;
                line = itr;
            }
        });

        if (line) {
            let v1 = line.start.clone().sub(line.end.clone()).normalize();
            let v2 = pos.clone().sub(base.clone()).normalize();
            if (Math.abs(v1.dot(v2)) < 0.03) {
                let ptSnap = line.closestPointToPoint(base, true, new THREE.Vector3());
                if (this._isValidOrthoSnapping(ptSnap.clone(), pos)) {
                    this._snappedPoint = ptSnap;
                }
            }
        }
    
        return (null != this._snappedPoint);
    }
}

export { FootPointSnap2d }