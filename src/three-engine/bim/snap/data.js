import * as THREE from 'three'

class SnapData {
    constructor() {
        this._xs = new Set();
        this._ys = new Set();
        this._ms = new Set();
        this._ps = new Set();
        this._cs = new Set();
        this._ls = [];
        this._base = null;
        this._isOrtho = false;
        this._supportMidpoint = false;
    }

    static setFromLines(lines) {
        let p = new SnapData();
        lines.forEach(itr => {
            let p0 = itr.start;
            let p1 = itr.end;
            p._fillFromTwoPoints(p0, p1);
        });
        p._calcCrossPoints();
        return p;
    }

    static setFromPts(pts) {
        let p = new SnapData();
        pts.forEach(itr => {
            p._ps.add(itr);
            p._xs.add(itr.x);
            p._ys.add(itr.y);
        });
        return p;
    }

    _fillFromTwoPoints(p0, p1) {
        let line = new THREE.Line3(new THREE.Vector3(p0.x, p0.y, 0), new THREE.Vector3(p1.x, p1.y, 0));
        this._ls.push(line);
        this._ps.add(p0);
        this._ps.add(p1);
        this._xs.add(p0.x);
        this._ys.add(p0.y);
        this._xs.add(p1.x);
        this._ys.add(p1.y);
        if (this._supportMidpoint) {
            let mid = new THREE.Vector3((p0.x + p1.x) / 2, (p0.y + p1.y) / 2, 0);
            this._ms.add(mid);
            this._xs.add(mid.x);
            this._ys.add(mid.y);
        }
    }

    get base() {
        return this._base;
    }

    set base(p) {
        this._base = p;
    }

    get isOrtho() {
        return this._isOrtho;
    }

    set isOrtho(p) {
        this._isOrtho = p;
    }
    
    get xs() {
        return this._xs;
    }

    set xs(p) {
        this._xs = p;
    }

    get ys() {
        return this._ys;
    }

    set ys(p) {
        this._ys = p;
    }

    get ls() {
        return this._ls;
    }

    set ls(p){
        this._ls = p;
    }

    get ms() {
        return this._ms;
    }

    set ms(p) {
        this._ms = p;
    }

    get ps() {
        return this._ps;
    }

    set ps(p) {
        this._ps = p;
    }

    get cs() {
        return this._cs;
    }

    _calcCrossPoints() {
        this._cs.clear();
        for (let i = 0; i < this._ls.length; i++) {
            let s1 = this._ls[i];
            for (let j = i + 1; j < this._ls.length; j++) {
                let s2 = this._ls[j];
                let p = this._getIntersect(s1.start, s1.end, s2.start, s2.end);
                if (p) {
                    this._cs.add(new THREE.Vector3(p.x, p.y, 0));
                }
            }
        }
    }

    _getIntersect(a, b, c, d) {
        let area_abc = (a.x - c.x) * (b.y - c.y) - (a.y - c.y) * (b.x - c.x);
        let area_abd = (a.x - d.x) * (b.y - d.y) - (a.y - d.y) * (b.x - d.x); 
        if (area_abc * area_abd >= 0) {
            return null;
        }
        let area_cda = (c.x - a.x) * (d.y - a.y) - (c.y - a.y) * (d.x - a.x);
        let area_cdb = area_cda + area_abc - area_abd;
        if (area_cda * area_cdb >= 0) {
            return null;
        }
        let t = area_cda / (area_abd - area_abc);
        let dx = t * (b.x - a.x);
        let dy = t * (b.y - a.y);
        return { x: a.x + dx, y: a.y + dy };
    }
}

export { SnapData }
