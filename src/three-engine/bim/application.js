import { Application } from '../core/application';
import { BimViewerManager } from './display/viewermanager';
import { ColorSchemeManager } from './display/colorscheme/manager';
import { Font } from '../core/model/font';
import { AxisGrid } from './model/objects/axisgrid';
import { Global } from './display/base/global';

class BimApplication extends Application {
    constructor() {
        super();
        this._viewerMgr = new BimViewerManager();
        this._font = new Font();
        this._axisGrid = new AxisGrid();
        this._global = new Global();
        this._isRunningRapidAxisGrid = false;
        this._isAxisGridEditMode = false;
    }

    get isAxisGridEditMode() {
        return this._isAxisGridEditMode;
    }

    set isAxisGridEditMode(p) {
        this._isAxisGridEditMode = p;
    }

    get font() {
        return this._font;
    }

    get axisGrid() {
        return this._axisGrid;
    }

    get global() {
        return this._global;
    }

    get isRunningRapidAxisGrid() {
        return this._isRunningRapidAxisGrid;
    }

    set isRunningRapidAxisGrid(p) {
        this._isRunningRapidAxisGrid = p;
    }

    destroy() {
        super.destroy();
        this._viewerMgr.destroy();
    }

    _init(options) {
        this._viewerMgr.init();
        this._font.load();
        this._colorSchemeMgr = new ColorSchemeManager();
    }
}

export { BimApplication }