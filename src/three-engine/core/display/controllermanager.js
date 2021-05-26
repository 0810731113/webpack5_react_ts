import { Controller } from './controller';
import { ControllerFactoryTypes } from './controllerfactory/type';
import { ControllerFactory3d } from './controllerfactory/controllerfactory3d';
import { ControllerFactory2d } from './controllerfactory/controllerfactory2d';

class ControllerManager {
    constructor() {
        this._csviews = new Map();
        this._elemcsviews = new Map();
        this._factories = new Map();
        this._instance = null;
        this._defaultController = new Controller();
        this._init();
    }

    static instance() {
        if (!this._instance) {
            this._instance = new ControllerManager();
        }
        return this._instance;
    }

    get defaultController() {
        return this._defaultController;
    }

    _init() {
        this._factories.clear();
        let arr = [
            new ControllerFactory3d(),
            new ControllerFactory2d()
        ];
        arr.forEach(itr => {
            this._factories.set(itr.type, itr);
        });
    }

    _getFactory(viewtype) {
        let e = null;
        switch (viewtype) {
            case '2d':
            case 'RapidGridViewer2d':
                e = ControllerFactoryTypes.Viewer2d;
                break;
            case '3d':
                e = ControllerFactoryTypes.Viewer3d;
                break;
        }
        return e ? this._factories.get(e) : null;
    }

    getController(entitytype, viewtype, component, viewable) {
        let controllers = this._csviews.get(viewtype);
        if (!controllers) {
            controllers = new Map();
            this._csviews.set(viewtype, controllers);
        }
        let c = controllers.get(entitytype);
        if (!c) {
            let p = this._getFactory(viewtype);
            if (p) {
                let data = {};
                data.entitytype = entitytype;
                data.viewtype = viewtype;
                data.component = component;
                data.viewable = viewable;
                c = p.make(data);
            }
        }
        if (c) {
            controllers.set(entitytype, c);
        }
        return c;
    }
}

export { ControllerManager }