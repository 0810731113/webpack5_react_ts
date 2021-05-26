class CameraControl {
    constructor(context) {
        this._context = context;
        this._control = null;
        this._data = null;
    }

    get control() {
        return this._control;
    }
    
    camera() {
        return this._context.camera;
    }
    
    setup() {
    }

    render() {
    }

    resize() {
    }

    enabled(t) {
    }

    target() {
        return this._control.target;
    }

    resetCamera() {
    }

    setTarget(pos) {
    }

    applySettings(options) {
    }

    rotate(q) {
    }

    keys(enabled) {
    }

    load() {  
        let camera = this._context.camera;
        if (!camera || !this._control) {
            return;
        }
        let data = this._data;
        if (!data) {
            return;
        }
        camera.near = data.near;
        camera.far = data.far;
        camera.rotation.copy(data.rotation);
        camera.fov = data.fov;
        camera.position.copy(data.pos);
        camera.aspect = data.aspect;
        camera.left = data.left;
        camera.right = data.right;
        camera.top = data.top;
        camera.bottom = data.bottom;
        this._control.target.copy(data.target);
        this.setTarget(data.target);
        camera.updateProjectionMatrix();
        this.render();
    }

    save() {
        let camera = this._context.camera;
        if (!camera || !this._control) {
            return;
        }
        let data = {};
        data.pos = camera.position.clone();
        data.aspect = camera.aspect;
        data.left = camera.left;
        data.right = camera.right;
        data.top = camera.top;
        data.bottom = camera.bottom;
        data.fov = camera.fov;
        data.target = this._control.target.clone();
        data.near = camera.near;
        data.far = camera.far;
        data.rotation = camera.rotation.clone();
        this._data = data;
    }

    ray() {
        let camera = this.camera();
        if (!this._control || !camera) {
            return null;
        }
        let pos = camera.position;
        let target = this._control.target;
        let ray = target.clone().sub(pos);
        return ray.normalize();
    }
}

export { CameraControl }