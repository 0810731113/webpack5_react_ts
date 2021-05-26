import * as THREE from 'three'
import { Viewer } from '../../../core/display/viewer';
import { Creator3d } from './creator';
import { CameraMode } from '../../../core/camera/mode';
import { Application } from '../../../core/application';
import { entityTypes } from '../../../core/model/entitytypes';
import { ViewTypes } from '../../viewtypes';

class Viewer3d extends Viewer {
    constructor() {
        super();
        this._type = ViewTypes.web3d;
        this._cmdTransform = null;
        this._cameraOffset = new THREE.Vector3(15600, -15800, 18000);
        this._fit = false;
        this._seletedRoom = null;
        this._savedCamera = {};
    }

    get selectedRoom() {
        return this._seletedRoom;
    }

    set selectedRoom(room) {
        this._seletedRoom = room;
    }

    init(domElement) {
        let initialized = this.initialized;
        super.init(domElement);
        if (!initialized) {
            let fp = this._cameraMgr.setupFirstPersonControl();
            this._cameraMgr.mode = CameraMode.orbit;
            fp.control.enabled = false;
            this._creator = new Creator3d(this._scene.foreground, this._context);
        }
    }

    destroy() {
        super.destroy();
    }

    renderFrame(e) {
        let bOK = super.renderFrame(e);
        if (!bOK) {
            return;
        }

        let options = {};
        options.timeEpsilon = e.timeEpsilon;
        this._renderMgr.render(options);
    }

    onFirstPerson() {
        if (this._cameraMgr.mode !== CameraMode.firstperson) {
            this._save3dCameraInfo();
            this._cameraMgr.toggle(CameraMode.firstperson);

            if (!this._restoreFirstPersonCameraInfo()) {
                this._cameraMgr.getControl().resetCamera();
            }
        }
    }

    on3d() {
        if (this._cameraMgr.mode !== CameraMode.orbit) {
            this._saveFirstPersonCameraInfo();

            this._cameraMgr.toggle(CameraMode.orbit);

            this._restore3dCameraInfo();
        }
    }

    onEnterFirstPersonBefore() {
        super.onEnterFirstPersonBefore();
        let viewer = Application.instance().getActiveView();
        let room = null;
        let selector = viewer.selector;
        let arr = selector.ss();
        for (let i = 0; i < arr.length; i++) {
            let ent = arr[i];
            if (ent.type == entityTypes.Room) {
                room = ent;
                break;
            }
        }
        if (room != null) {
            this._seletedRoom = room;
        }
    }

    _save3dCameraInfo() {
        this._savedCamera.camera3dPos = this._context.camera.position.clone();
    }

    _restore3dCameraInfo() {
        if (this._savedCamera.camera3dPos) {
            this._context.camera.position.copy(this._savedCamera.camera3dPos);
            this._savedCamera.camera3dPos = undefined;
            this._context.needsRendering = true;

            return true;
        }

        return false;
    }

    resize(domId) {
        super.resize(domId);
        this._viewables.forEach(item => {
            item.updateResolution(this._context.clientRect.width, this._context.clientRect.height);
        });
    }

    _saveFirstPersonCameraInfo() {
        this._savedCamera.cameraFirstPerson = {};
        this._savedCamera.cameraFirstPerson.room = this._seletedRoom;
        this._savedCamera.cameraFirstPerson.position = this._context.camera.position.clone();
        this._savedCamera.cameraFirstPerson.target = this._cameraMgr.getControl().target().clone();
    }

    _restoreFirstPersonCameraInfo() {
        if (this._savedCamera.cameraFirstPerson
            && this._savedCamera.cameraFirstPerson.room
            && this._savedCamera.cameraFirstPerson.room == this._seletedRoom) {
            this._context.camera.position.copy(this._savedCamera.cameraFirstPerson.position);
            this._cameraMgr.getControl().setTarget(this._savedCamera.cameraFirstPerson.target);

            this._savedCamera.cameraFirstPerson = undefined;

            this._context.needsRendering = true;
            return true;
        }

        return false;
    }

    _setupRenderOptions() {
        super._setupRenderOptions();
        this._renderOptions.turnOnGamma = true;
    }

    _setupCamera(context) {
        let w = this._domElement.width;
        let h = this._domElement.height;
        let camera = new THREE.PerspectiveCamera(50, w / h, 10, 2000000);
        camera.position.copy(this._cameraOffset);
        camera.up.set(0, 0, 1);
        camera.lookAt(new THREE.Vector3(0, 0, -1));
        context.camera = camera;
    }

    _setCameraWithBbox(bbox) {
        super._setCameraWithBbox(bbox);
        let control = this._cameraMgr.getControl();
        let camera = control.camera();
        if (bbox) {
            const center = bbox.getCenter(new THREE.Vector3());
            center.z = 1500; // half of wall
            let pos = new THREE.Vector3().addVectors(this._cameraOffset, center);
            camera.position.copy(pos);
            let bbsize = bbox.getSize(new THREE.Vector3());
            const maxDim = Math.max(bbsize.x + 800, bbsize.y + 800, 3000);
            const fov = camera.fov * (Math.PI / 180);
            let cameraZ = Math.abs(maxDim / 4 * Math.tan(fov * 2));
            cameraZ *= 1.4; // zoom out a little so that objects don't fill the screen

            camera.position.z = cameraZ;
            control.lookat(center);
        }
        let dist = camera.position.distanceTo(control.target());
        let dir = new THREE.Vector3(-1, 1, -1);
        dir = dir.normalize().multiplyScalar(dist);
        let target = camera.position.clone().add(dir);
        control.setTarget(target);
        camera.updateProjectionMatrix();
        control.render();
    }

    _onProjectLoaded() {
        this.fitScreen();
    }

    fitScreen() {
        if (this._cameraMgr.mode == CameraMode.firstperson) {
            return;
        }
        super.fitScreen();
    }

    _drawAxis() {
        let x = this._drawTool.createLineWith2Points(new THREE.Vector3(0, 0, 0), new THREE.Vector3(1000, 0, 0), new THREE.MeshBasicMaterial({color:0xff0000}));
        let y = this._drawTool.createLineWith2Points(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1000, 0), new THREE.MeshBasicMaterial({color:0x00ff00}));
        let z = this._drawTool.createLineWith2Points(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 1000), new THREE.MeshBasicMaterial({color:0x0000ff}));
        let scene = this._scene.background;
        scene.add(x);
        scene.add(y);
        scene.add(z);
    }
}

export { Viewer3d }