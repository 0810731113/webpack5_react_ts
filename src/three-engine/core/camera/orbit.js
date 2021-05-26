import { CameraControl } from './control';
import OrbitControls from 'three-orbitcontrols';
import * as THREE from 'three'
import { EventsManager } from '../events/manager';
import { Events } from '../events/events';

class OrbitCameraControl extends CameraControl {
    constructor(context) {
        super(context);
        this._timer = null;
        this._timerStart = null;
        this._started = false;
    }

    setup() {
        this._control = new OrbitControls(this._context.camera, this._context.canvas);
        this._control.rotateSpeed = 0.32;
        this._control.panSpeed = 0.5;
        this._setupEvents();
        this._control.enableDamping = true;
        this._control.dampingFactor = 0.7;
        this._control.maxDistance = 200000;
        this._control.minZoom = 0.05;
        this._control.maxZoom = 500;
        this._control.enabled = false;
    }

    render() {
        this._control.update();
    }

    enabled(t) {
        this._control.enabled = t;
    }

    keys(enabled) {
        this._control.enableKeys = enabled;
    }

    lookat(pos) {
        this._control.target = pos;
    }

    setTarget(pos) {
        this._control.target = pos.clone();
    }

    rotate(q) {
        let camera = this._context.camera;
        let pos = camera.position;
        let ray = new THREE.Vector3(0, 1, 0);
        ray.applyQuaternion(q);
        let delta = ray.multiplyScalar(1000);
        let target = pos.clone().add(delta);
        this._control.target = target;
        this._control.update();
    }

    enabledRotate(t) {
        this._control.enableRotate = t;
    }

    enabledZoom(t) {
        this._control.enableZoom = t;
    }

    enabledPan(t) {
        this._control.enablePan = t;
    }

    enabledKeys(t){
        this._control.enableKeys = t;
    }

    isEnabled() {
        return this._control.enabled;
    }

    resetCamera() {
        this._control.object = this._context.camera;
    }

    applySettings(options) {
        options = options || {};
        if (options.rotation != undefined) {
            this._control.enableRotate = options.rotation;
        }
        if (options.enableDamping === false) {
            this._control.enableDamping = false;
            this._control.panSpeed = 1.0;
        }
        if(options.enableScreenSpacePanning != undefined){
            this._control.screenSpacePanning = options.enableScreenSpacePanning;
        }
        if (options.rotateSpeed != undefined) {
            this._control.rotateSpeed = options.rotateSpeed;
        }
        if (options.enableZoom != undefined) {
            this._control.enableZoom = options.enableZoom;
        }
        if (options.enablePan != undefined) {
            this._control.enablePan = options.enablePan;
        }
    }

    _setupEvents() {
        this._control.addEventListener('change', itr => {
            EventsManager.instance().dispatch(Events.cameraChanging, this);
            if (!this._started) {
                EventsManager.instance().dispatch(Events.cameraChangeStarted);
                let t = window.setTimeout(() => {
                    EventsManager.instance().dispatch(Events.cameraChangeStartedWithDelay);
                    window.clearTimeout(t);
                }, 150);
                this._started = true;
            }
            this._delayTrigger(Events.cameraChangeEnded);
            this._context.needsRendering = true;
        });
        this._control.addEventListener('start', itr => {
            this._context.needsRendering = true;
        });
        this._control.addEventListener('end', itr => {
            this._context.needsRendering = true;
        });
    }

    _delayTrigger(e) {
        if (this._timer) {
            window.clearTimeout(this._timer);
            this._timer = null;
        }
        this._timer = window.setTimeout(() => {
            EventsManager.instance().dispatch(e);
            this._started = false;
        }, 250);
    }
}

export { OrbitCameraControl }