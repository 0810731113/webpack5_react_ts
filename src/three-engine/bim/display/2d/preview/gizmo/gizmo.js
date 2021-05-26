import * as THREE from 'three'
import { VertPreview2d } from '../elements/vert';
import { HorzPreview2d } from '../elements/horz';
import { SnapTypes } from 'three-engine/bim/snap/type';
import { EndPointPreview2d } from '../elements/endpoint';
import { MidPointPreview2d } from '../elements/midpoint';
import { ElementPreview2d } from '../elements/element';
import { AxisHead } from '../../objects/axishead';
import { FootPointPreview2d } from '../elements/footpoint';

class AxisLineGizmo2d extends THREE.Object3D {
    constructor(viewer, drawTool, dim, snaps) {
        super();
        this._viewer = viewer;
        this._drawTool = drawTool;
        this._dim = dim;
        this._snaps = snaps;
        this._editBox = null;
        this._meshes = [];
        this._showDim = true;
        this._dimEditable = false;
        this._textures = null;
        this._dragging = false;
        this._pl = viewer.pixelLength();
    }

    set textures(p) {
        this._textures = p;
    }

    set showDim(show) {
        this._showDim = show;
    }

    set dimEditable(able) {
        this._dimEditable = able;
    }

    get snappingEnabled() {
        return true;
    }

    set dragging(p) {
        this._dragging = p;
    }

    _drawAxisLine(p0, p1) {
        if (!this._dragging) {
            if (p0 && p1) {
                let s = p0;
                let e = p1;
                let v = [];
                v.push(s.x);
                v.push(s.y);
                v.push(s.z);
                v.push(e.x);
                v.push(e.y);
                v.push(e.z);
                let data = {};
                data.vertices = v;
                let line = this._drawTool.createDashedLine(data, new THREE.LineDashedMaterial({ color: 0x00FFFF, linewidth: 1, gapSize: 400, dashSize: 600 }));
                this.add(line);
            }
            let H = this._drawHead(p0, p1);
            this.add(H);
            let HL = this._drawHeadLines(p0, p1);
            if (HL) {
                this.add(HL);
            }
        }
        if (p0 && p1) {
            this._drawDim(p0, p1);
        }
    }

    _drawHead(p0, p1) {
        let v = this._viewer;
        let dir = this._getDir(p0, p1);
        let entity = { start: p0, end: p1, startExt: 3000, endExt:3000, text: null, dir: dir };
        let p = new AxisHead(v, entity, this._drawTool, v.pl);
        p.draw();
        p.applyMaterial('highlight');
        return p;
    }

    _drawDim(p0, p1) {
        let dir = p1.clone().sub(p0);
        dir.normalize();
        let axis = new THREE.Vector3(1, 0, 0);
        let q = new THREE.Quaternion().setFromUnitVectors(axis, dir);
        let t = p0.clone();
        let s = new THREE.Vector3(1, 1, 1);
        let m = new THREE.Matrix4().compose(t, q, s);
        const H = 3 * this._pl;
        const L = p0.distanceTo(p1);
        let dd = 10 * this._pl;
        let h = 2 * H + dd;
        let l = L;
        let ps = new THREE.Vector3(0, h, 0);
        let pe = new THREE.Vector3(l, h, 0);
        ps.applyMatrix4(m);
        pe.applyMatrix4(m);
        let data = [{ org: ps, pt: pe, extra: null }];
        data.dimEditable = this._dimEditable;
        this._dim.option = { T1: true, C: 0x000000, Dist: dd, Top: dd * 0.5, UseDefinedColor: false };
        this._dim.setData(data);
    }

    _getDir(p0, p1) {
        let dir = new THREE.Vector3(1, 0, 0);
        let dist = p0.distanceTo(p1);
        if (p1 && dist > 0) {
            dir = new THREE.Vector3().subVectors(p1, p0).normalize();
        }
        return dir;
    }

    _drawHeadLines(p0, p1) {
        if (!p0) {
            return null;
        }
        let node = new THREE.Object3D();
        let dir = this._getDir(p0, p1);
        let l1 = this._drawHeadLine(p0, dir, false);
        let l2 = this._drawHeadLine(p1, dir, true);
        if (l1) {
            node.add(l1);
        }
        if (l2) {
            node.add(l2);
        }
        return node;
    }

    _drawHeadLine(p, dir, isEnd) {
        if (!p) {
            return null;
        }
        let p0 = new THREE.Vector3(p.x, p.y, p.z);
        let ext = 3000;
        let p1 = new THREE.Vector3().addVectors(p0, dir.clone().multiplyScalar(isEnd ? ext : -ext));
        let mat = new THREE.LineBasicMaterial({ color: 0x00FFFF });
        return this._drawTool.createLineWith2Points(p0, p1, mat);
    }

    draw(p0, p1) {
        this._drawSnaps(p1, this._snaps);

        if (!p0 || (!p0 && !p1)) {
            return;
        }
        this._drawAxisLine(p0, p1);
    }

    _isLine(p0, p1) {
        if (!p0 || !p1) {
            return false;
        }
        return p0.distanceTo(p1) > 0.1;
    }

    updateMatrixWorld() {
        super.updateMatrixWorld();
        if (!this._meshes) {
            return;
        }
        let s = this._viewer.pixelScale;
        s = this._viewer.pixelLength() / this._pl;
        this._meshes.forEach(itr => {
            if (itr) {
                itr.scale.setScalar(s);
            }
        });
    }

    _drawSnaps(pt, snaps) {
        if (!pt || !snaps) {
            return;
        }
        if (snaps.length < 1) {
            return;
        }
        let p = null;
        snaps.forEach(itr => {
            switch (itr.type) {
                case SnapTypes.Vert:
                    p = new VertPreview2d();
                    break;
                case SnapTypes.Horz:
                    p = new HorzPreview2d();
                    break;
                case SnapTypes.EndPoint:
                    p = new EndPointPreview2d();
                    this._pivotSnapped = true;
                    break;
                case SnapTypes.Segment:
                    p = new ElementPreview2d();
                    break;
                case SnapTypes.Cross:
                    p = new MidPointPreview2d();
                    this._pivotSnapped = true;
                    break;
                case SnapTypes.FootPoint:
                    p = new FootPointPreview2d();
                    break;
            }
            if (p) {
                p.viewer = this._viewer;
                p.pl = this._viewer.pl;
                p.textures = this._textures;
                p.draw(pt.x, pt.y);
                this.add(p);
            }
        });
    }
}

export { AxisLineGizmo2d }