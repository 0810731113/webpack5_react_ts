import { DragController } from '../../base/controller';
import * as THREE from 'three'
import { Application } from 'three-engine/core/application';
import { AxisLineSnapManager } from 'three-engine/bim/snap/axisline/manager';
import { InteractionPlane } from '../interactionplane';
import { PreviewTypes } from 'three-engine/core/model/previewtypes';
import { DirtyType } from 'three-engine/core/display/dirtytype';
import Point from 'three-engine/core/model/point';
import { TextEditor } from 'commands/textEditor';

const PivotDraggingState = Object.freeze({
    Start: Symbol.for('start'),
    End: Symbol.for('end'),
    Free: Symbol.for('free'),
});

class AxisLineController extends DragController {
    constructor() {
        super();
        this._ds = PivotDraggingState.Free;
        this._viewer = null;
        this._workplane = null;
        this._start = null;
        this._preview = null;
        this._snapMgr = new AxisLineSnapManager();
        this._setup(Application.instance().getActiveView());
    }

    get isOrtho() {
        return true;
    }

    get object() {
        return this._entity.entity;
    }

    setEntity(p) {
        super.setEntity(p);
        let viewer = this._entity.context.viewer;
        if (this._viewer != viewer) {
            this._setup(viewer);
        }
    }

    _setup(viewer) {
        this._viewer = viewer;
        this._workplane = new InteractionPlane(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 0), this._viewer.context.camera);
        this._snapMgr.setup(this._viewer);
    }

    del() {
        if (!this._viewer.isEditable(this.object)) {
            return;
        }
        if (!Application.instance().isAxisGridEditMode) {
            return;
        }
        super.del();
    }

    onDblClick(e, param) {
        super.onDblClick(e, param);
        if (!Application.instance().isAxisGridEditMode) {
            return;
        }
        let id = param.meshId;
        let data = this._entity.innerMesh;
        if (!data.has(id)) {
            return;
        }
        let p = this._entity.entity;
        let ptModel = param.object.position.clone();
        let ptScreen = this._viewer.model2screen(ptModel);
        let context = this._viewer.context;
        let r = context.clientRect;
        this._editBox = new TextEditor(context.containerElement);
        this._editBox.setCallback((value) => {
            if (!value) {
                return false;
            }
            p.name = value;
            p.dirty = DirtyType.All;

        });
        this._editBox.setPosition(ptScreen.x - r.left, ptScreen.y - r.top);
        this._editBox.focus();
    }

    onselected() {
        this._entity.applyMaterial('selected');
    }

    ondeselected() {
        this._entity.applyMaterial('normal');
    }

    onhoverstart() {
        this._entity.applyMaterial('highlight');
    }

    onhoverend() {
        this._entity.applyMaterial(this._isEntitySelected() ? 'selected' : 'normal');
    }

    _draggable() {
        return Application.instance().isAxisGridEditMode ? this._viewer.isDraggable(this._entity.entity) : false;
    }

    onDragstart(e, param) {
        this._selected = this._isEntitySelected();
        if (!this._draggable()) {
            return false;
        }
        if (param) {
            this._ds = PivotDraggingState.Free;
            if (this._isHitStart(param)) {
                this._ds = PivotDraggingState.Start;
            }
            else if (this._isHitEnd(param)) {
                this._ds = PivotDraggingState.End;
            }
            if (this._ds != PivotDraggingState.Free) {
                let p = this._getSnap(e);
                let v = p.v;
                this._snapMgr.setup(this._viewer, v.clone(), true);
                this._preview = this._viewer.createPreview(PreviewTypes.AxisLine);
                if (this._draggable()) {
                    this._viewer.selector.ssClear();
                }
            }
        }
        return true;
    }

    onDragmove(e, param) {
        this._entity.isDragging = false;
        if (!this._draggable()) {
            return false;
        }
        this._enableCamera(false);
        switch (this._ds) {
            case PivotDraggingState.Start: {
                let pt = this.object.end;
                this._start = new THREE.Vector3(pt.x, pt.y, pt.z);
                let p = this._getSnap(e);
                this._updatePreviews(this._start, p.v, p.r);
                this.object.start = new Point(p.v.x, p.v.y, p.v.z);
                this._entity.isDragging = true;
            }
                break;
            case PivotDraggingState.End: {
                let pt = this.object.start;
                this._start = new THREE.Vector3(pt.x, pt.y, pt.z);
                let p = this._getSnap(e);
                this._updatePreviews(this._start, p.v, p.r);
                this.object.end = new Point(p.v.x, p.v.y, p.v.z);
                this._entity.isDragging = true;
            }
                break;
        }
        this._onStateChanged(this._state.Moving);
        this._entity.context.needsRendering = true;
        return true;
    }

    onDragend(e, param) {
        if (this._preview) {
            this._viewer.delViewable(this._preview);
        }
        return super.onDragend(e, param);
    }

    onRightClick(e) {
        this.onDragend(e, null);
    }

    _updatePreviews(p0, p1, snaps) {
        this._preview.setData({ start: p0, end: p1, snaps: snaps, thickness: this.thickness, dimEditable: false, dragging: true });
    }

    _getPoint(e) {
        let p = this._viewer.screen2Canvas(e.clientX, e.clientY);
        let v = this._workplane.intersect(p);
        return v;
    }

    _getSnap(e) {
        let snaps = null;
        let ptSnap = null;
        let v = this._getPoint(e);
        if (!e.ctrlKey) {
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
        let dir = this.object.dir.clone();
        if (this._ds == PivotDraggingState.Start) {
            dir.negate();
        }
        let vec = new THREE.Vector3().subVectors(v, this._start);
        let val = vec.dot(dir);
        if (val < 10) {
            val = 0;
        }
        v = new THREE.Vector3().addVectors(this._start.clone(), dir.clone().multiplyScalar(val));
        return v;
    }

    _isHitStart(param) {
        if (param.meshId == this._entity.pivotStart.uuid) {
            return true;
        }
        let ptHit = param.point;
        let s = this.object.start;
        let ptStart = new THREE.Vector3(s.x, s.y, s.z);
        let dist = ptHit.distanceTo(ptStart);
        return this._toPixel(dist) < 10;
    }

    _isHitEnd(param) {
        if (param.meshId == this._entity.pivotEnd.uuid) {
            return true;
        }
        let ptHit = param.point;
        let e = this.object.end;
        let ptEnd = new THREE.Vector3(e.x, e.y, e.z);
        let dist = ptHit.distanceTo(ptEnd);
        return this._toPixel(dist) < 10;
    }

    _toPixel(dist) {
        let viewer = Application.instance().getActiveView();
        if (!viewer) {
            return dist;
        }
        let len = viewer.pixelLength();
        return Math.floor(dist / len + 0.5);
    }
}

export { AxisLineController }