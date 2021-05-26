import * as THREE from 'three'
import { Viewer } from '../../../core/display/viewer';
import { Camera } from '../../../core/model/camera';
import { Application } from '../../../core/application';
import { DirtyType } from '../../../core/display/dirtytype';

class Viewer2dBase extends Viewer {
    constructor() {
        super();
        this._inference = null;
        this._monitorCameral = null;
    }

    get inference() {
        return this._inference;
    }

    init(domId) {
        super.init(domId);
        this._cameraMgr.getControl().applySettings({ rotation: false, enableDamping: false });
    }

    destroy() {
        super.destroy();
    }

    setCameraToLastView(lastView) {
        let lastControl = lastView._cameraMgr.getControl();
        let lastCamera = lastControl.camera();

        let control = this._cameraMgr.getControl();

        let camera = control.camera();
        camera.aspect = lastCamera.aspect;
        camera.left = lastCamera.left;
        camera.right = lastCamera.right;
        camera.top = lastCamera.top;
        camera.bottom = lastCamera.bottom;
        camera.position.copy(lastCamera.position);
        camera.zoom = lastCamera.zoom;
        camera.updateProjectionMatrix();

        control.lookat(lastControl.target().clone());
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

    _setupRenderOptions() {
        this._renderOptions.turnOnGamma = false;
    }

    _setupCamera(context) {
        let camera = context.camera ? context.camera : new THREE.OrthographicCamera(window.innerWidth / -2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / -2, -5000, 50000);
        camera.position.set(0, -6, 8000);
        camera.up.set(0, 0, 1);
        camera.lookAt(new THREE.Vector3(0, 0, -1));
        context.camera = camera;
        camera.zoom = 3;
    }
    
    onTransformStarted(viewable) {
    }

    onTransformEnded() {
    }

    startMonitorCameral(cameralControl) {
        if (this._monitorCameral == null) {
            this._monitorCameral = new Camera();

            this._monitorCameral.design = Application.instance().designManager.currentDesign;
            this._monitorCameral.cameraControl = cameralControl;
            let pos = cameralControl.camera().position;
            this._monitorCameral.setPosition(pos);
            this._monitorCameral.dirty = DirtyType.All;
            this._onEntityAdded(this._monitorCameral);
        }

    }

    endMonitorCameral() {
        if (this._monitorCameral != null) {
            this._monitorCameral.design = Application.instance().designManager.currentDesign;

            this._onEntityRemoved(this._monitorCameral);
            this._monitorCameral = null;
        }
    }

    _setCameraWithBbox(bbox) {
        super._setCameraWithBbox(bbox);
        let control = this._cameraMgr.getControl();
        let camera = control.camera();
        if (bbox) {
            const center = bbox.getCenter(new THREE.Vector3());
            control.lookat(center);
            camera.position.copy(new THREE.Vector3(center.x, center.y - 8, center.z + 8480));
            camera.zoom = 2;
        }
        camera.updateProjectionMatrix();
        control.render();
    }
}

export { Viewer2dBase }