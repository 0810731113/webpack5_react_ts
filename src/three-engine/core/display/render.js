import * as THREE from 'three'

class Render {
    constructor(scene, camera, options) {
        this._scene = scene;
        this._camera = camera;
        this._renderer = null;
        this._ccmgr = null;
        this._init(options);
    }

    render(options) {
        if (this._ccmgr) {
            this._ccmgr.update();
        }
        this._renderer.clear();
        this._renderScene(this._scene.background);
        this._renderScene(this._scene.foreground);
    }

    set ccmgr(c) {
        this._ccmgr = c;
    }

    setSize(width, height) {
        this._renderer.setSize(width, height);
        if (this._ccmgr) {
            this._ccmgr.resize();
        }
        if (this._renderer) {
            this._renderer.antialias = (width * height < 2000 * 2000);
        }
    }

    setClearColor(color, alpha) {
        this._renderer.setClearColor(color, alpha);
    }

    getCanvas() {
        return this._renderer ? this._renderer.domElement : null;
    }

    resetCamera(camera) {
        this._camera = camera;
        this._camera.updateProjectionMatrix();
    }

    destroy() {
        this._scene.background = undefined;
        this._scene.foreground = undefined;
        this._camera = undefined;
        this._renderer.dispose();
        this._renderer = undefined;
    }

    dumpAsJPEG(){
        if (this._ccmgr) {
            this._ccmgr.update();
        }

        this._renderer.clear();
        this._renderScene(this._scene.foreground);

        let imgData = this._renderer.domElement.toDataURL();
        return imgData;
    }

    _renderScene(scene) {
        if (!(scene instanceof THREE.Scene)) {
            return;
        }

        if (scene.autoUpdate === true) {
            scene.updateMatrixWorld();
        }
        this._renderer.render(scene, this._camera);
    }

    _init(options) {
        options = options || {};
        this._setupRenderer(options);

        var clearColor = options.clearColor === undefined ? 0xffffff : options.clearColor;
        this.setClearColor(clearColor, options.clearOpacity);
        var width = options.width || window.innerWidth;
        var height = options.height || window.innerHeight;
        this.setSize(width, height);
    }

    _setupRenderer(options) {
        let renderer = new THREE.WebGLRenderer({
            antialias: true,
            preserveDrawingBuffer: true,
            alpha: options.alpha || false,
        });
        renderer.autoClear = false;
        renderer.setPixelRatio(window.devicePixelRatio);
        if (options.turnOnGamma) {
            renderer.gammaInput = true;
            renderer.gammaOutput = true;
        }
        this._renderer = renderer;
    }
}

export { Render }