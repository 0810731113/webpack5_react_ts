import { OrbitCameraControl } from './orbit';
import { CameraMode } from './mode'
import { EventsManager } from '../events/manager';
import { Events } from '../events/events';
import { FirstPersonCameraControl } from './firstperson';

class CameraControlManager {
    constructor(context) {
        this._mode = CameraMode.orbit;
        this._context = context;
        this._controls = new Map();
        let orbit = new OrbitCameraControl(context);
       
        this._controls.set(CameraMode.orbit, orbit);
        this._controls.forEach(itr => {
            itr.setup();
        });
        EventsManager.instance().listen(Events.cameraStateChanged, this.cameraStateChanged, this);
        EventsManager.instance().listen(Events.cameraEnablePan, this.cameraEnablePan, this);
    }

    setupFirstPersonControl() {
        let fp = new FirstPersonCameraControl(this._context);
        this._controls.set(CameraMode.firstperson, fp);
        fp.setup();
        EventsManager.instance().listen(Events.cameraStateChanged, this.cameraStateChanged, this);
        return fp;
    }

    disable(){
        EventsManager.instance().unlisten(Events.cameraStateChanged, this.cameraStateChanged, this);
        this.getControl().enabled(false);
    }

    destroy() {
        EventsManager.instance().unlisten(Events.cameraStateChanged, this.cameraStateChanged, this);
    }

    cameraStateChanged(data) {
        let control = this.getControl();
        control.enabled(data.enabled);
    }

    cameraEnablePan(data){
        let control = this.getControl();
        if(control&& control instanceof OrbitCameraControl){
            control.enabledKeys(data.enabled);
        }
    }

    update() {
        let control = this.getControl();
        if (control) {
            control.render();
            let args = {};
            args.mode = this._mode;
            args.camera = control.camera();
            args.control = control;
            EventsManager.instance().dispatch(Events.cameraUpdated, args);
        }
    }

    resize() {
        let control = this.getControl();
        if (control) {
            control.resize();
        }
    }

    getControl() {
        return this._controls.get(this._mode);
    }

    toggle(mode) {
        if (mode == this._mode) {
            return;
        }
        // this.getControl(this._mode).save();
        this.mode = mode;
        // this.getControl(this._mode).load();
    }

    get mode() {
        return this._mode;
    }

    set mode(m) {
        this.getControl(this._mode).enabled(false);
        this._mode = m;
        this.getControl(this._mode).enabled(true);
        this._context.needsRendering = true;
    }
}

export { CameraControlManager } 