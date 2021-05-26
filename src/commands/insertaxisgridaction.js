import { InteractionPlane } from "three-engine/bim/display/2d/interactionplane";
import Action from "three-engine/core/actions/action";
import { Application } from "three-engine/core/application";
import { DirtyType } from "three-engine/core/display/dirtytype";
import * as THREE from 'three'

class InsertAxisGridAction extends Action {
    constructor(controller, viewable, snapMgr) {
        super();
        this._controller = controller;
        this._viewable = viewable;
        this._snapMgr = snapMgr;
        this._viewer = viewable.context.viewer;
        this._plane = new InteractionPlane(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 0), viewable.context.camera)
    }

    get isOrtho() {
        return true;
    }

    get snappingEnabled() {
        return true;
    }

    mouseMove(viewer, e) {
        let p = this._getSnap(e);
        this._viewable.node.position.copy(p.v);
        this._viewable.context.needsRendering = true;
    }

    lMouseUp(viewer, e) {
        this._controller.onDragend(e);
        this.markFinished();
        let grid = Application.instance().axisGrid;
        let entity = this._viewable.entity;
        let arr = entity.getAxisLines();
        let pos = this._viewable.node.position.clone();
        arr.forEach(itr => {
            itr.adjustPos(pos);
            grid.addTransient(itr);
            itr.dirty = DirtyType.All;
        });
        
        this._viewer.delViewable(this._viewable);
    }

    keyUp(viewer, event) {
        super.keyUp(this._viewer, event);
        if (this._viewer && event.key === 'Escape') {
            this._viewer.delViewable(this._viewable);
        }
    }

    _pick(viewer, e) {
        let ptScreen = {};
        ptScreen.x = e.clientX;
        ptScreen.y = e.clientY;
        let infos = this._viewer.pick(ptScreen);
        let result = {};
        result.event = e;
        result.infos = infos;
        return result;
    }

    _getPoint(e) {
        let p = this._viewer.screen2Canvas(e.clientX, e.clientY);
        let v = this._plane.intersect(p);
        return v;
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

        let useSnapPoint = false;
        if (snaps && ptSnap) {
            snaps.forEach(itr => {
                switch (itr.type) {
                    case SnapTypes.MidPoint:
                    case SnapTypes.EndPoint:
                    case SnapTypes.Segment:
                    case SnapTypes.FootPoint:
                        useSnapPoint = true;
                        break;
                }
            });
        }

        if (useSnapPoint) {
            return ptSnap;
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

export { InsertAxisGridAction }