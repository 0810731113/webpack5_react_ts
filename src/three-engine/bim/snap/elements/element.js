import { Application } from 'three-engine/core/application';

class Element2d {
    constructor() {
        this._type = null;
        this._data = null;
        this._MINDIST = 20;
        this._snappedPoint = null;
        this._priority = 0;
    }

    get priority() {
        return this._priority;
    }
    
    get type() {
        return this._type;
    }

    snap(pos) {
        return false;
    }

    get data() {
        return this._data;
    }

    set data(p) {
        this._data = p;
    }

    get MINDIST() {
        return this._MINDIST;
    }

    get snappedPoint() {
        return this._snappedPoint;
    }

    _toPixel(dist) {
        let viewer = Application.instance().getActiveView();
        if (!viewer) {
            return dist;
        }
        let len = viewer.pixelLength();
        return Math.floor(dist / len + 0.5);
    }

    _isValidOrthoSnapping(snapped, pos) {
        let bOK = true;
        let base = this._data.base;
        if (base) {
            bOK = Math.abs(base.x - snapped.x) < 1e-3 || Math.abs(base.y - snapped.y) < 1e-3;
        }
        return bOK;
    }

    _isOrthoSnappingValid(snapped, pos) {
        if (!this._data.isOrtho) {
            return true;
        }

        let base = this._data.base;
        if (!base) {
            return true;
        }
        return this._is3PointsColinear(snapped, base, pos)
    }

    _is3PointsColinear(a, b, c) {
        var A = a.distanceTo(b);
        var B = b.distanceTo(c);
        var C = c.distanceTo(a);
        var p = 0.5 * (A + B + C);
        return !(p * (p - A) * (p - B) * (p - C));
    }
}

export { Element2d }