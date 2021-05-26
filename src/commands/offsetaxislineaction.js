import { InteractionPlane } from "three-engine/bim/display/2d/interactionplane";
import Action from "three-engine/core/actions/action";
import { Application } from "three-engine/core/application";
import { DirtyType } from "three-engine/core/display/dirtytype";
import * as THREE from 'three'
import { AxisLine } from "three-engine/bim/model/objects/axisline";
import Point from "three-engine/core/model/point";
import { AxisLine2d } from "three-engine/bim/display/2d/objects/axisline";
import { PreviewTypes } from "three-engine/core/model/previewtypes";

class OffsetAxisLineAction extends Action {
    constructor(viewer, data) {
        super();
        this._controller = null;
        this._viewable = null;
        this._viewer = viewer;
        this._HL = null;
        this._data = data;
        this._plane = new InteractionPlane(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 0), viewer.context.camera);
        this._setup();
    }

    get viewable() {
        return this._viewable;
    }

    _setup() {
        const ents = this._viewer.selector.ss();
        if (ents.length !== 1) {
            return;
        }
        const ent = ents[0];
        if (!(ent instanceof AxisLine)) {
            return;
        }
        let offset = new AxisLine();
        let id = offset.id;
        offset.fromJson(ent.toJson());
        offset.id = id;
        offset.name = '';
        this._data.axisline = offset;
        this._data.pivot = ent.mid;
        this._data.pos = ent.mid;
        this._data.src = ent;
        this._viewable = this._viewer.createPreview(PreviewTypes.OffsetPreview, this._data);
        this._data.dirty = DirtyType.All;
        this._controller = this._viewable.controller;
        this._viewable.handler = this;
        this._viewer.selector.do(this._data, { viewable: this._viewable });
        this._viewer.context.needsRendering = true;
        this._data.dirty = DirtyType.All;
        this._controller.onDragstart({ clineX: 0, clentY: 0 });
        this._controller.offset = new THREE.Vector3(0, 0, 0);

        // highlight the source entity 
        //
        let src = this._viewer.lookupViewable(this._data.src);
        src.applyMaterial('selected');
    }
    
    _select(e) {
        let viewable = this._getPickedAxisLine(e);
        if (viewable) {
            this._viewer.selector.do(viewable.entity, { viewable: viewable });
        }
    }

    _hover(e) {
        if (this._HL) {
            this._HL.applyMaterial('normal');
        }
        let viewable = this._getPickedAxisLine(e);
        if (viewable) {
            viewable.applyMaterial('highlight');
            this._HL = viewable;
        }
    }

    _getPickedAxisLine(e) {
        let picked = null;
        let ptScreen = { x: e.clientX, y: e.clientY };
        let arr = this._viewer.pick(ptScreen);
        arr.forEach(itr => {
            if (picked) {
                return;
            }
            let p = itr.viewable;
            if (p instanceof AxisLine2d) {
                picked = p;
            }
        });
        return picked;
    }

    mouseMove(viewer, e) {
        if (!this._viewable) {
            this._hover(e);
            return;
        }
        let p = this._getPoint(e);
        let data = this._viewable.entity;
        data.pos = p;
        data.dirty = DirtyType.All;
    }

    lMouseUp(viewer, e) {
        if (!this._viewable) {
            this._select(e);
            this._setup();
            return;
        }
        this._controller.onDragend(e);
        this.markFinished();
        let data = this._viewable.entity;
        let axisline = data.axisline;
        this._commit(axisline);
    }

    keyUp(viewer, e) {
        super.keyUp(this._viewer, e);
        if (!this._viewable) {
            return;
        }
        if (this._viewer && e.key === 'Escape') {
            this._viewer.delViewable(this._viewable);
        }
    }

    onEdit(val, dir) {
        this.markFinished();
        let norm = dir.normalize();
        norm.multiplyScalar(val);
        let data = this._viewable.entity;
        let axisline = data.axisline;
        let ps = data.src.start;
        let pe = data.src.end;
        let s = new THREE.Vector3().addVectors(new THREE.Vector3(ps.x, ps.y, ps.z), norm);
        let e = new THREE.Vector3().addVectors(new THREE.Vector3(pe.x, pe.y, pe.z), norm);
        axisline.start = new Point(s.x, s.y, s.z);
        axisline.end = new Point(e.x, e.y, e.z);
        this._commit(axisline);
        return true;
    }

    _commit(axisline) {
        let grid = Application.instance().axisGrid;
        let p = new AxisLine();
        p.fromJson(axisline.toJson());
        p.name = '';
        grid.addTransient(p);
        this._data.axisline = p;
        this._viewer.delViewable(this._viewable);
    }

    _getPoint(e) {
        let p = this._viewer.screen2Canvas(e.clientX, e.clientY);
        let v = this._plane.intersect(p);
        return v;
    }
}

export { OffsetAxisLineAction }