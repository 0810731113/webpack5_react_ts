import { EventsManager } from './events/manager';
import { Events } from './events/events';

class Application {
    constructor() {
        this._viewerMgr = null;
        this._instance = null;
        this._colorSchemeMgr = null;
    }

    static setInstance(p) {
        this._instance = p;
    }

    static instance() {
        return this._instance;
    }

    run(options) {
        this._init(options);
        this._bump();
    }

    _init(options) {
    }

    get viewerManager() {
        return this._viewerMgr;
    }

    get viewers() {
        return this._viewerMgr.viewers;
    }

    get colorSchemeMgr() {
        return this._colorSchemeMgr;
    }

    applyColorSchemeChanged(type) {
        if (this._colorSchemeMgr) {
            this._colorSchemeMgr.applyScheme(type);
        }
    }
    
    getActiveView() {
        return this._viewerMgr.getActiveView();
    }

    destroy() {
        EventsManager.instance().dispatch(Events.designWillClose, this);
        EventsManager.instance().dispatch(Events.designClosed, this);
        EventsManager.instance().onDesignClosed();
    }

    _bump() {
        let time = Date.now();
        let e = {};
        let render = function () {
            e.timeEpsilon = Date.now() - time;
            time = Date.now();
            requestAnimationFrame(render);
            this.viewers.forEach(itr => {
                itr.renderFrame(e);
            });
            this._onFrameRendered();
        }.bind(this);

        render();
    }

    _onFrameRendered() {
        EventsManager.instance().dispatch(Events.frameRendered);
    }
}

export { Application }