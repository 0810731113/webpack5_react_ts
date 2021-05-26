import * as THREE from 'three'
import { Controller } from '../../../core/display/controller';
import { Application } from '../../../core/application';
import { Events } from '../../../core/events/events';
import { EventsManager } from '../../../core/events/manager';
import { DirtyType } from '../../../core/display/dirtytype';

class DragController extends Controller {
    constructor() {
        super();
        this._ray = new THREE.Raycaster();
        this._camera = null;
        this._plane = new THREE.Plane();
        this._raycaster = new THREE.Raycaster();
        this._mouse = new THREE.Vector2();
        this._offset = new THREE.Vector3();
        this._ptStart = new THREE.Vector3();
        this._ptHit = new THREE.Vector3();
        this._intersection = new THREE.Vector3();
        this._plane.setFromNormalAndCoplanarPoint(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 0));
        this._state = Object.freeze({
            Started: Symbol.for('started'),
            Moving: Symbol.for('moving'),
            Ended: Symbol.for('ended'),
        });
    }

    set offset(p) {
        this._offset.copy(p);
    }

    get ptHit() {
        return this._ptHit;
    }

    get houseTool() {
        let entity = this._entity.entity;
        let design = entity ? entity.design : Application.instance().designManager.currentDesign;
        return design.housePlan.houseTool;
    }

    set enableCamera(p) {
        this._enableCamera(p);
    }

    del() {
        super.del();
        this.done();
    }

    setEntity(p) {
        super.setEntity(p);
        this._camera = this._entity.context.camera;
    }

    onClick(e, param) {
        super.onClick(e, param);
        this._enableCamera(true);
    }

    onDragstart(e, param) {
        this._selected = this._isEntitySelected();
        if (!this._draggable()) {
            return false;
        }
        this.enableCamera = false;
        let point = this._getPointer(e);
        this._raycaster.setFromCamera(point, this._camera);
        let pos = this._entity.node.position;
        this._plane.setFromNormalAndCoplanarPoint(new THREE.Vector3(0, 0, 1), pos.clone());
        if (this._raycaster.ray.intersectPlane(this._plane, this._intersection)) {
            this._ptStart = pos.clone();
            this._ptHit = param ? param.point : new THREE.Vector3(0, 0, 0);
            this._offset.copy(this._intersection).sub(pos);
        }
        this._onStateChanged(this._state.Started);
        EventsManager.instance().dispatch(Events.entityDragStarted, { event: e, object: this._entity.entity });
        return true;
    }

    onDragmove(e, param) {
        if (!this._draggable()) {
            return false;
        }
        this.enableCamera = false;
        let point = this._getPointer(e);
        this._raycaster.setFromCamera(point, this._camera);
        if (this._raycaster.ray.intersectPlane(this._plane, this._intersection)) {
            let pos = this._intersection.sub(this._offset);
            this._onDraggingUpdate(pos, e);
        }
        this._onStateChanged(this._state.Moving);
        this._entity.context.needsRendering = true;
        return true;
    }

    onDragend(e, param) {
        if (!this._draggable()) {
            return false;
        }
        this._onDraged();
        this._entity.entity.stageChange();
        this.enableCamera = true;
        this._onStateChanged(this._state.Ended);
        EventsManager.instance().dispatch(Events.entityDragEnded, { event: e, object: this._entity.entity });
        return true;
    }

    onDrop(e) {
        this._selected = true;
        this.onDragmove(e);
        this.onDragend(e);
        this._selected = false;
    }

    onKeyup(e, top) {
        super.onKeyup(e, top);
        if (e.key === 'Escape') {
            this.done();
        }
    }

    onKeydown(e, top) {

    }

    done() {
        this._enableCamera(true);
    }

    get ptStart() {
        return this._ptStart;
    }

    _getPointer(e) {
        return this._entity.context.viewer.screen2Canvas(e.clientX, e.clientY);
    }

    _onStateChanged(state) {
    }

    _onDraggingUpdate(pos) {
        this._entity.setPosition(pos);
        this._entity.entity.setPosition(pos);
    }

    _onDraged() {
        let pos = this._entity.node.position.clone();
        this._entity.entity.setPosition(pos);
    }

    _draggable() {
        return this._selected && this._entity.movable();
    }
}

export { DragController }