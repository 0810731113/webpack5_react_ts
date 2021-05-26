import * as THREE from 'three'
import Action from 'three-engine/core/actions/action';
import Point from 'three-engine/core/model/point';
import { InteractionPlane } from 'three-engine/bim/display/2d/interactionplane';
import { SnapTypes } from 'three-engine/bim/snap/type';
import actionManager from 'three-engine/core/actions/actionmanager';
import { AxisLine } from 'three-engine/bim/model/objects/axisline';
import { Application } from 'three-engine/core/application';

class CreateAxisLineAction extends Action {
    constructor(preview, viewer, snapMgr) {
        super();
        this._viewer = viewer;
        this._preview = preview;
        this._preview.handler = this;
        this._snapMgr = snapMgr;
        this._plane = new InteractionPlane(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 0), this._viewer.context.camera)
        this._lines = [];
        this._pivots = [];
        this._start = null;
        this._end = new THREE.Vector3();
        this._dimEditablexy = {'x': true, 'y': false};
    }

    get isOrtho() {
        return true;
    }

    get snappingEnabled() {
        return true;
    }

    get grid() {
        return Application.instance().axisGrid;
    }

    lMouseUp(viewer, e) {
        let p = this._getSnap(e);
        let v = p.v;
        this._handleInput(viewer, v);
    }

    _startPreviews(p0, p1) {
        this._dimEditablexy = {'x': true, 'y': false};
    }

    _updatePreviews(p0, p1, snaps) {
        this._preview.setData({ start: p0, end: p1, snaps: snaps, thickness: this.thickness, dimEditable: true });
    }

    _endPreviews(p1) {
    }

    mouseMove(viewer, e) {
        let p = this._getSnap(e);
        if (this._start) this._end.copy(p.v);
        this._updatePreviews(this._start, p.v, p.r);
    }

    markCancelled() {
        super.markCancelled();
        actionManager.reset();
    }

    _isSnapped(snaps) {
        if (!snaps) {
            return false;
        }
        let snapped = false;
        for (let i = 0; i < snaps.length; i++) {
            let snap = snaps[i];
            switch (snap.type) {
                case SnapTypes.Segment:
                case SnapTypes.EndPoint:
                case SnapTypes.FootPoint:
                case SnapTypes.MidPoint:
                    snapped = true;
                    break;
            }
        }
        return snapped;
    }

    _getPoint(e) {
        let p = this._viewer.screen2Canvas(e.clientX, e.clientY);
        let v = this._plane.intersect(p);
        return v;
    }

    _handleInput(viewer, pt) {
        let v = pt.clone();
        if (!this._start) {
            this._start = v;
            this._snapMgr.setup(viewer, v.clone(), this.isOrtho);
            return;
        }
        let v1 = new Point(this._start.x, this._start.y, this._start.z);
        let v2 = new Point(v.x, v.y, v.z);
        this._create(v1, v2);
        this._onCreated(viewer, v);
    }

    _onCreated(viewer, v) {
        if (this._pivots.length < 1) {
            this._pivots.push(this._start);
        }
        this._pivots.push(v);
        this._start = v;
        this._snapMgr.setup(viewer, v.clone(), this.isOrtho);

        // finish current and continue the command
        //
        actionManager.cancelAndResumeCurrentCommand();
    }

    onEdit(val, dir) {
        let v = new THREE.Vector3();
        v.addVectors(this._start.clone(), dir.clone().multiplyScalar(val));
        this._handleInput(this._viewer, v, false);
        let snaps = null;
        let r = this._snapMgr.snap(v);
        if (r) {
            v = r.point.clone();
            snaps = r.snaps;
        }
        this._updatePreviews(v, v, snaps, this.thickness);
        return true;
    }

    _create(p1, p2) {
        let p = new AxisLine();
        p.buildFrom2Points(p1, p2);
        this.grid.addTransient(p);
    }

    _getSnap(e) {
        let snaps = null;
        let ptSnap = null;
        let v = this._getPoint(e);
        if (this.snappingEnabled && !e.ctrlKey) {
            let r = this._snapMgr.snap(v);
            if (r) {
                ptSnap = r.point.clone();
                snaps = r.snaps;
            }
        }
        v = this._handleOrtho(snaps, v, ptSnap);
        return { r: snaps, v: v };
    }

    _handleOrtho(snaps, pos, ptSnap) {
        let v = pos.clone();
        if (!this.isOrtho || !this._start) {
            return ptSnap ? ptSnap : v;
        }
        v = ptSnap ? ptSnap : v;
        let x = v.x - this._start.x;
        let y = v.y - this._start.y;
        if (Math.abs(x) < Math.abs(y)) {
            v.x = this._start.x;
        } else {
            v.y = this._start.y;
        }
        return v;
    }
}

export { CreateAxisLineAction }