import * as THREE from 'three'
import { Viewer } from '../../../core/display/viewer';
import { CameraMode } from '../../../core/camera/mode';
import { CreatorWebCam } from './creator';
import { ViewTypes } from '../../viewtypes';
import { Cube } from '../../model/webcam/cube';
import { EventsManager } from '../../../core/events/manager';
import { Events } from '../../../core/events/events';

class WebCamViewer extends Viewer {
    constructor() {
        super();
        this._type = ViewTypes.webcam;
        this._cameraOffset = new THREE.Vector3(-0, -50, 1000);
        this._cube = null;
    }

    init(domElement) {
        let initialized = this.initialized;
        super.init(domElement);
        if (!initialized) {
            this.linePickPrecision = 100;
            this._cameraMgr.getControl().applySettings({ enablePan: false, enableZoom: false, rotateSpeed: 0.3 });
            this._cameraMgr.mode = CameraMode.orbit;
            this._creator = new CreatorWebCam(this._scene.foreground, this._context);
            this._drawCube();
            EventsManager.instance().listen(Events.cameraChanging, this._onCameraChanging, this);
        }
    }

    _setupCamera(context) {
        let camera = context.camera ? context.camera : new THREE.OrthographicCamera(window.innerWidth / -2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / -2, -5000, 50000);
        camera.up.set(0, 0, 1);
        camera.lookAt(new THREE.Vector3(1, -1, 1));
        context.camera = camera;
        camera.zoom = 1;
    }

    _drawCube() {
        this._cube = new Cube();
        this._cube.notifyAdded();
    }

    _drawGrid() {
    }

    _setCameraWithBbox(bbox) {
        super._setCameraWithBbox(bbox);
        let control = this._cameraMgr.getControl();
        let camera = control.camera();
        if (bbox) {
            const center = bbox.getCenter(new THREE.Vector3());
            control.lookat(center);
            camera.position.copy(new THREE.Vector3(1, -1, 1));
            camera.zoom = 7;
        }
        camera.updateProjectionMatrix();
        control.render();
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

    destroy() {
        EventsManager.instance().unlisten(Events.cameraChanging, this._onCameraChanging, this);
    }

    _onCameraChanging(controlSource) {
        if (controlSource === this._cameraMgr.getControl()) {
            return;
        }
        let cameraSource = controlSource.camera();
        let pos = cameraSource.position;
        let dir = controlSource.target().clone().sub(pos).normalize();
        let control = this._cameraMgr.getControl();
        let camera = control.camera();
        camera.up.copy(cameraSource.up);
        let target = camera.position.clone().add(dir);
        control.setTarget(target);
        this._context.needsRendering = true;
    }
}

export { WebCamViewer }