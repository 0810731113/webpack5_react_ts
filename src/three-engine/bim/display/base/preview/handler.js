import * as THREE from 'three'
import { Events } from '../../../../core/events/events';
import { EventsManager } from '../../../../core/events/manager';
import { entityTypes } from '../../../../core/model/entitytypes';
import { BackgroundWallController3d } from '../../3d/elements/backgroundwall/controller';
import { ShowerRoomController } from '../elements/showerroom/controller';
import prodInfoExtention from '../../../model/objects/prodInfo/prodinfoExtention';
import prodPositionType from '../../../model/objects/prodInfo/prodpositiontype';
import { RoomSet } from '../../../model/objects/room/roomset';

class ManipulatorEventsHandler {
    constructor(camera, domElement, object, viewer) {
        this._entity = object;
        this._object = object.node;
        this._axis = 'X';
        this._mode = 'T';
        this._space = 'world';
        this._camera = camera;
        this._plane = null;
        this._domElement = domElement;
        this._ray = new THREE.Raycaster();
        this._viewer = viewer;
        this._positionStart = new THREE.Vector3();
        this._quaternionStart = new THREE.Quaternion();
        this._scaleStart = new THREE.Vector3();
        this._worldPositionStart = new THREE.Vector3();
        this._worldQuaternionStart = new THREE.Quaternion();
        this._worldScaleStart = new THREE.Vector3();
        this._worldPosition = new THREE.Vector3();
        this._worldQuaternion = new THREE.Quaternion();
        this._worldScale = new THREE.Vector3();
        this._identityQuaternion = new THREE.Quaternion();
        this._pointStart = new THREE.Vector3();
        this._pointEnd = new THREE.Vector3();
        this._rotationAxis = new THREE.Vector3();
        this._rotationAngle = 0;
        this._cameraPosition = new THREE.Vector3();
        this._cameraQuaternion = new THREE.Quaternion();
        this._cameraScale = new THREE.Vector3();
        this._eye = new THREE.Vector3();
        this._tempVector = new THREE.Vector3();
        this._tempVector2 = new THREE.Vector3();
        this._tempQuaternion = new THREE.Quaternion();
        this._unit = {
            RX: new THREE.Vector3(1, 0, 0),
            RY: new THREE.Vector3(0, 1, 0),
            RZ: new THREE.Vector3(0, 0, 1)
        }
        this._identityQuaternion = new THREE.Quaternion();
        this._alignVector = new THREE.Vector3();
        EventsManager.instance().listen(Events.prodDragging, this.onProdDragging, this);
        EventsManager.instance().listen(Events.prodTransformStarted, this.onProdDragStarted, this);
        EventsManager.instance().listen(Events.prodTransformEnded, this.onProdDragEnded, this);
        EventsManager.instance().listen(Events.adsorbPlaneAdjusted, this.onAdsorbPlaneAdjusted, this);
    }

    get entity() {
        return this._entity;
    }

    get viewer() {
        return this._viewer;
    }

    destory() {
        EventsManager.instance().unlisten(Events.prodDragging, this.onProdDragging, this);
        EventsManager.instance().unlisten(Events.prodTransformStarted, this.onProdDragStarted, this);
        EventsManager.instance().unlisten(Events.prodTransformEnded, this.onProdDragEnded, this);
        EventsManager.instance().unlisten(Events.adsorbPlaneAdjusted, this.onAdsorbPlaneAdjusted, this);
    }

    onProdDragStarted(args) {
        if (args == this || !this._manipulator) {
            return;
        }
        let node = this._manipulator.node;
        if (!node) {
            return;
        }
        this._manipulator.node.visible = false;
    }

    onProdDragEnded(args) {
        if (args == this || !this._manipulator) {
            return;
        }
        let node = this._manipulator.node;
        if (!node) {
            return;
        }
        let prod = this._entity.entity;
        node.position.copy(prod.getPosition());
        this._manipulator.node.visible = true;

        // move 'prod' in/out of the room based on ray-pick
        //
        if (prod.type == entityTypes.Prod) {
            let pos = this._manipulator.node.position;
            let roomSet = RoomSet.self(prod.design);
            let room = roomSet ? roomSet.findRoom(pos) : null;
            if (room) {
                room.moveIn(prod);
            } else {
                room = prod.room;
                if (room) {
                    room.moveOut(prod);
                }
            }
        }
    }

    onProdDragging(args) {
        let object = args.object;
        if (object != this._entity) {
            return;
        }
        if (!this._manipulator) {
            return;
        }
        let node = this._manipulator.node;
        if (node) {
            node.position.copy(object.node.position);
            this._manipulator._entity.setPosition(object.node.position);
        }
    }

    onAdsorbPlaneAdjusted(args) {
        if (args == this || !this._manipulator) {
            return;
        }
        let node = this._manipulator.node;
        if (!node) {
            return;
        }
        let t = new THREE.Vector3();
        let r = new THREE.Quaternion();
        let s = new THREE.Vector3();
        this._entity.entity.mtxLocal.decompose(t, r, s);
        this._manipulator.gizmoR.quaternion.copy(r);
    }

    setAxis(name) {
        this._axis = name;
        switch (name) {
            case 'RZ':
                this._mode = 'R';
                break;
            case 'X':
            case 'Y':
            case 'Z':
            case 'XY':
                this._mode = 'T';
                break;
            case 'xl':
            case 'xr':
            case 'yt':
            case 'yb':
                this._mode = 'S';
                break;
        }
    }

    setData(p, triad) {
        this._plane = p;
        this._manipulator = triad;
    }

    onMouseDown(e) {
        if (this._entity.entity.comp) {
            const prodInfo = this._entity.entity.comp.prodInfo;
            this._posTypeName =prodInfoExtention.getProdPositionType(prodInfo);
        }
        let pointer = this.getPointer(e);
        this._object = this._entity.node;
        if (this._object === undefined || (pointer.button !== undefined && pointer.button !== 0)) {
            return;
        }

        let controller = this._entity.controller;
        if (controller) {
            controller.onAdsorbStart();
        }
        if ((pointer.button === 0 || pointer.button === undefined) && this._axis !== null) {
            this._ray.setFromCamera(pointer, this._camera);
            this._updatePlane();
            let planeIntersect = this._ray.intersectObjects([this._plane], true)[0] || false;
            if (planeIntersect) {
                this._object.updateMatrixWorld();
                this._positionStart.copy(this._entity.getManipulatorCenter());
                this._quaternionStart.copy(this._entity.quaternion);
                this._scaleStart.copy(this._object.scale);
                this._object.matrixWorld.decompose(this._worldPositionStart, this._worldQuaternionStart, this._worldScaleStart);
                this._pointStart.copy(planeIntersect.point).sub(this._worldPositionStart);
                EventsManager.instance().dispatch(Events.prodTransformStarted, this);
            }
        }
        this.ptlast = { x: e.clientX, y: e.clientY }
    }

    onMouseMove(e, param) {
        let pointer = this.getPointer(e);
        let axis = this._axis;
        let mode = this._mode;
        let object = this._object;
        let space = this._space;
        let ray = this._ray;

        if (object === undefined || axis === null || (pointer.button !== undefined && pointer.button !== 0)) {
            return;
        }
        ray.setFromCamera(pointer, this._camera);
        let planeIntersect = ray.intersectObjects([this._plane], true)[0] || false;
        if (planeIntersect === false) {
            return;
        }

        this._pointEnd.copy(planeIntersect.point).sub(this._worldPositionStart);
        if (mode === 'T') {
            if (axis.search('X') === -1) {
                this._pointEnd.x = this._pointStart.x;
            }
            if (axis.search('Y') === -1) {
                this._pointEnd.y = this._pointStart.y;
            }
            if (axis.search('Z') === -1) {
                this._pointEnd.z = this._pointStart.z;
            }

            let pos = new THREE.Vector3(0, 0, 0);
            if (space === 'local') {
                pos.copy(this._pointEnd).sub(this._pointStart).applyQuaternion(this._quaternionStart);
            } else {
                pos.copy(this._pointEnd).sub(this._pointStart);
            }

            pos.add(this._positionStart);

            // note: make sure it at least can stay on the ground
            //
            if (pos.z < 0) {
                pos.z = 0;
            }
            this._entity.setPosition(pos);
            this._onTransformChanging(false);

            let useAdsorb = true;
            let controller = this._entity.controller;
            if (this._posTypeName == prodPositionType.qiangmian && this._canAdsorb(e, axis)) {
                controller.handlePositionTypeOnWall(e, true);
                useAdsorb = false;
            } else if (this._posTypeName == prodPositionType.dingmian && this._canAdsorb(e, axis)) {
                controller.handlePositionTypeOnCeiling(e, true);
                useAdsorb = false;
            }

            if (controller instanceof BackgroundWallController3d) {
                controller.handlePositionTypeOnWall(e, true);
                controller._adjustPos(controller.entity);
                useAdsorb = false;
            } else if (controller instanceof ShowerRoomController) {
                controller._adjustPos(controller.entity);
                useAdsorb = false;
            }

            if (useAdsorb) {
                if (controller && this._canAdsorb(e, axis)) {
                    controller.onAdsorb(param);
                }
            }
            if (this._manipulator) {
                const pos = this._entity.node.position.clone();
                let node = this._manipulator.node;
                if (node) {
                    node.position.copy(pos);
                }
            }
        } else if (mode === 'R') {
            var unit = this._unit[axis];
            if (axis === 'RZ') {
                this._rotationAxis.copy(unit);
                this._rotationAngle = this._calcRotationAngle(e, this._entity.getManipulatorCenter(), this.ptlast);
                let quat = new THREE.Quaternion();
                quat.setFromAxisAngle(this._rotationAxis, this._rotationAngle);
                quat.premultiply(this._quaternionStart);
                quat = this._snap(quat);
                this._manipulator.gizmoR.quaternion.copy(quat);
                this._entity.setRotation(quat);
                this._manipulator.onTransform();
                this._onTransformChanging(false);
            }
        } else if (mode === 'S') {
            this._manipulator.onGripsChanged(this._entity, axis, this._pointEnd);
        }
    }

    _canAdsorb(e, axis) {
        return (!e.ctrlKey && axis != 'Z');
    }

    onMouseUp(e) {
        let controller = this._entity.controller;
        if (controller) {
            controller.onAdsorbEnd();
        }
        let pointer = this.getPointer(e);
        if (pointer.button !== undefined && pointer.button !== 0) {
            return;
        }
        if (pointer.button === undefined) this._axis = null;

        let pos = this._entity.node.position.clone();
        let entity = this._entity.entity;
        entity.setPosition(pos);
        this._manipulator.onTransform();
        this._onTransformChanging(true);
        EventsManager.instance().dispatch(Events.prodTransformEnded, this);
    }

    getPointer(event) {
        let pointer = event.changedTouches ? event.changedTouches[0] : event;
        let rect = this._domElement.getBoundingClientRect();
        return {
            x: (pointer.clientX - rect.left) / rect.width * 2 - 1,
            y: - (pointer.clientY - rect.top) / rect.height * 2 + 1,
            button: event.button
        }
    }

    _onTransformChanging(done) {
        let controller = this._entity.controller;
        if (controller) {
            controller.onTransformChanging(done);
        }
    }

    _snap(quat) {
        return this._manipulator.snap(quat);
    }

    _calcRotationAngle(e, o, ptlast) {
        let curPt = { x: e.clientX, y: e.clientY };
        let ptOrg = this._viewer.model2screen(o);
        let cur = new THREE.Vector3(curPt.x, curPt.y, 0);
        let org = new THREE.Vector3(ptOrg.x, ptOrg.y, 0);
        let tar = new THREE.Vector3(ptlast.x, ptlast.y, 0);
        let v1 = cur.sub(org);
        let v2 = tar.sub(org);
        v1.normalize();
        v2.normalize();
        let normal = new THREE.Vector3();
        normal.copy(v1).cross(v2);
        let angle = v1.angleTo(v2) * (normal.dot(new THREE.Vector3(0, 0, 1)) < 0 ? -1 : 1);
        return angle;
    }

    _updatePlane() {
        this._object.matrixWorld.decompose(this._worldPosition, this._worldQuaternion, this._worldScale);
        this._camera.matrixWorld.decompose(this._cameraPosition, this._cameraQuaternion, this._cameraScale);
        if (this._camera instanceof THREE.PerspectiveCamera) {
            this._eye.copy(this._cameraPosition).sub(this._worldPosition).normalize();
        } else if (this._camera instanceof THREE.OrthographicCamera) {
            this._eye.copy(this._cameraPosition).normalize();
        }
        this._plane.axis = this._axis;
        this._plane.worldPosition = this._worldPosition.clone();
        this._plane.mode = this._mode;
        this._plane.eye = this._eye.clone();
        this._plane.cameraQuaternion = this._cameraQuaternion.clone();
        this._plane.updateMatrixWorld();
    }

    updateMatrixWorld(handles) {
        if (this._object) {
            this._object.updateMatrixWorld();
            this._object.matrixWorld.decompose(this._worldPosition, this._worldQuaternion, this._worldScale);
        }
        this._camera.updateMatrixWorld();
        this._camera.matrixWorld.decompose(this._cameraPosition, this._cameraQuaternion, this._cameraScale);
        for (let i = 0; i < handles.length; i++) {
            let handle = handles[i];
            let eyeDistance = this._worldPosition.distanceTo(this._cameraPosition);
            let s = this._manipulator.calcScale(eyeDistance, this._camera.zoom);
            handle.scale.set(s, s, s);
        }
    }
}

export { ManipulatorEventsHandler }