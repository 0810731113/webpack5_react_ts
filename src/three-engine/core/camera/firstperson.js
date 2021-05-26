import * as THREE from 'three'
import { CameraControl } from './control';
import { FirstPersonControls } from './firstpersoncontrols';
import { Application } from '../application';
import { entityTypes } from '../model/entitytypes';
import { EventsManager } from '../events/manager';
import { Events } from '../events/events';

class FirstPersonCameraControl extends CameraControl{
    constructor(context) {
        super(context);
        this._clock = new THREE.Clock();
    }

    setup() {
        this._control = new FirstPersonControls(this._context.camera, this._context.canvas, this._context, this);
        this._control.host = this;
        this._control.lookSpeed = 0;
        this._control.movementSpeed = 1;
        this._control.noFly = false;
        this._control.lookVertical = true;
        this._control.constrainVertical = true;
        this._control.verticalMin = 1.5;
        this._control.verticalMax = 2.0;
        this._control.lon = 250;
        this._control.lat = 30;
        this._control.changeTarget(0,0,1500);
    }

    lookat(pos) {
        this._control.target = pos;
    }

    rotate(q) {
        let camera = this._context.camera;
        let pos = camera.position;
        let ray = new THREE.Vector3(0, 1, 0);
        ray.applyQuaternion(q);
        let delta = ray.multiplyScalar(1000);
        let target = pos.clone().add(delta);
        this.setTarget(target);
        this._context.needsRendering = true;
    }

    render() {
        this._control.update(this._clock.getDelta());
    }

    resize() {
        this._control.handleResize();
    }

    keys(enabled) {
        this._control.enableKeys = enabled;
    }

    resetCamera() {
        let design = Application.instance().designManager.currentDesign;
        if (!design) {
            return;
        }
        let room = this._context.viewer.selectedRoom;
        if (!room) {
            room = design.getBestRoom();
            this._context.viewer.selectedRoom = room;
        }
        this.render();
        let pos = room ? room.getTextCenter() : new THREE.Vector3(3000, 5000, 0);
        pos.z = 1300;
        this._context.camera.position.copy(pos);
        this.setTarget(0, 0, 1500);
        this._control.needUpdate = false;
    }

    setTarget(pos) {
        this._control.changeTarget(pos.x, pos.y, pos.z);
    }

    enabled(t) {
        this._control.enabled = t;
    }

    isEnabled() {
        return this._control.enabled;
    }

    startClock() {
        this._clock.start();
    }

    onChangeStart() {
        EventsManager.instance().dispatch(Events.cameraChangeStarted);
    }

    onChangeEnd() {
        EventsManager.instance().dispatch(Events.cameraChangeEnded);
    }
}

export { FirstPersonCameraControl }