import { ViewTypes } from '../bim/viewtypes';
import bftokenapi from '../request/bimface/bftokenapi';

class BimfaceApplication {
    constructor() {
        this._app = null;
        this._defaultFileId = bftokenapi.defaultFileId;
        this._defaultViewToken = null;
        this._config = null;
        this._view3d = null;
        this._view2d = null;
    }

    init() {
        return new Promise((resolve, reject) => {

            bftokenapi.getViewToken(this._defaultFileId).then((res) => {
                this._defaultViewToken = res.data.data;
                let loaderConfig = new BimfaceSDKLoaderConfig();
                loaderConfig.viewToken = this._defaultViewToken;
                BimfaceSDKLoader.load(loaderConfig, () => resolve(), () => reject());
            }).catch(() => reject())
        });
    }

    initBf(token) {
        return new Promise((resolve, reject) => {
            let loaderConfig = new BimfaceSDKLoaderConfig();
            loaderConfig.viewToken = token;
            BimfaceSDKLoader.load(loaderConfig, () => resolve(), () => reject());
        });
    }

    run() {
        //this.load(this._defaultViewToken);
    }

    load3D(token) {
        return new Promise((resolve, reject) => {
            this._free();

            this.initBf(token).then(() => {
                this._setup3DConfig();
                this._app = new Glodon.Bimface.Application.WebApplication3D(this._config);
                this._view3d = this._app.getViewer();
                this._view3d.addEventListener(Glodon.Bimface.Viewer.Viewer3DEvent.ViewAdded, () => {
                    resolve();
                });
                this._app.addView(token);
            }).catch(() => reject())
        });
    }

    load2D(token) {
        return new Promise((resolve, reject) => {
            this._free();

            this.initBf(token).then(() => {
                this._setup2DConfig();
                this._app = new Glodon.Bimface.Application.WebApplicationDrawing(this._config);
                this._app.load(token);
                this._view2d = this._app.getViewer();
                this._view2d.addEventListener(Glodon.Bimface.Viewer.ViewerDrawingEvent.Loaded, () => {
                    resolve();
                });
            }).catch(() => reject())
        });
    }

    exit() {
        this._free();
    }

    _setup3DConfig() {
        this._config = new Glodon.Bimface.Application.WebApplication3DConfig();
        this._config.domElement = document.getElementById(ViewTypes.bf3d);
    }

    _setup2DConfig() {
        this._config = new Glodon.Bimface.Application.WebApplicationDrawingConfig();
        this._config.domElement = document.getElementById(ViewTypes.bf3d);
    }

    _free() {
        if (this._app && this._app.destroy) {
            this._app.destroy();
            this._app = null;
        }
    }
}

export { BimfaceApplication }