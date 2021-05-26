import * as THREE from 'three'
import * as math from 'mathjs'; 
import { Element2d } from './element';
import { SnapTypes } from '../type';

class SegmentSnap2d extends Element2d {
    constructor() {
        super();
        this._type = SnapTypes.Segment;
        this._MINDIST = 30;
        this._priority = 1;
    }

    snap(pos) {
        this._snappedPoint = null;
        let MINDIST = this.MINDIST;
        let ls = this._data.ls;
        ls.forEach(itr => {
            let ptSnap = this._getClosestPoint(pos, itr);
            if (ptSnap) {
                let dist = pos.distanceTo(ptSnap);
                dist = this._toPixel(dist);
                if (dist < MINDIST) {
                    MINDIST = dist;
                    this._snappedPoint = ptSnap.clone();
                }
            }
        });
        return (null != this._snappedPoint);
    }

    _getClosestPoint(pos, line) {
        let base = this._data.base;
        if (!base) {
            return line.closestPointToPoint(pos, true, new THREE.Vector3());
        }
        let v = this._getOrthoPoint(base, pos);
        return this._getIntersection(line.start, line.end, base, v);
    }

    _getIntersection(a, b, c, d) {
        let p = math.intersect([a.x, a.y], [b.x, b.y], [c.x, c.y], [d.x, d.y]);
        let v = p ? new THREE.Vector3(p[0], p[1], 0) : null;
        if (!v) {
            return null;
        }
        return this._isOnSegment(v, a, b) ? v : null;
    }  

    _isOnSegment(p, s, e) {
        const TOL = 1;
        let d = s.distanceTo(e);
        let d1 = s.distanceTo(p);
        let d2 = e.distanceTo(p);
        if (d1 < TOL || d2 < TOL) {
            return false;
        }
        return Math.abs(d1 + d2 - d) < TOL;
    }

    _getOrthoPoint(base, pos) {
        let v = pos.clone();
        let x = v.x - base.x;
        let y = v.y - base.y;
        let delta = 0;
        if (Math.abs(x) < Math.abs(y)) {
            v.x = base.x;
            delta = Math.abs(pos.x - v.x);
        } else {
            v.y = base.y;
            delta = Math.abs(pos.y - v.y);
        }
        delta = this._toPixel(delta);
        if (delta > this.MINDIST) {
            v = pos;
        }
        return v;
    }
}

export { SegmentSnap2d }