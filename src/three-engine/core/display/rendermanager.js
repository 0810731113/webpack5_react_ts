import { Render } from './render'

class RenderManager {

    constructor(context, scene, camera, options) {
        this._context = context;
        this._scene = scene;
        this._camera = camera;
        this._force = false;
        this._options = this._setupOptions(options);
        this._renderer = new Render(scene, camera, this._options);
        context.canvas = this._renderer.getCanvas();
    }

    render(options) {
        if (this._context.needsRendering || this._force) {
            this._context.needsRendering = false;
            this._renderer.render(options);
        }
    }

    ccmgr(c) {
        this._renderer.ccmgr = c;
    }

    resetCamera() {
        this._renderer.resetCamera(this._context.camera);
    }

    onResize(rect) {
        this._options.width = rect.width;
        this._options.height = rect.height;
        this._renderer.setSize(rect.width, rect.height);
        this._context.needsRendering = true;
    }

    set force(t) {
        this._force = t;
    }

    destroy() {
        let gl = this._context.canvas.getContext('webgl');
        this._renderer.destroy();
        this._renderer = undefined;
        if (gl) {
            gl.getExtension('WEBGL_lose_context').loseContext();
        }
    }

    dumpAsJPEG(){
        let imgData = this._renderer.dumpAsJPEG();
        return imgData;
    }

    _setupOptions(options) {
        options = options || {};

        let rendererOptions = {
            width: this._context.clientRect.width,
            height: this._context.clientRect.height,
            alpha: false,
            clearColor: 0xeeeeee,
            clearOpacity: 1,
        };

        Object.assign(rendererOptions, options);
        return rendererOptions;
    }
}

export { RenderManager }