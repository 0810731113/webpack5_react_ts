import actionManager from '../../../core/actions/actionmanager';


let _theOnlyOne = null;

class EnvironmentFactory {
    constructor() {
        this._activeEnvironment = null;

        this._creators = new Map();
        this._environments = new Map();
    }

    static get() {
        if (!_theOnlyOne) {
            _theOnlyOne = new EnvironmentFactory();
        }

        return _theOnlyOne;
    }

    registerCreator(type, creator) {
        this._creators.set(type, creator);
    }

    register(environment) {
        this._environments.set(environment.type, environment);
    }

    make(type) {
        let p = null;
        const creator = this._creators.get(type);
        if (creator) {
            p = creator();
        }
        return p;
    }

    get activeEnvironment() {
        return this._activeEnvironment;
    }

    switchEnvironment(type) {
        // Terminate active command in case it isn't ended yet
        actionManager.reset();

        if (this._activeEnvironment) {
            this._activeEnvironment.onLeave();
        }

        this._activeEnvironment = this._environments.get(type);

        if (this._activeEnvironment) {
            this._activeEnvironment.onEnter();
        }

        return;
    }
}

export { EnvironmentFactory }