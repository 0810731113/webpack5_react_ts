import { BimfaceApplication } from './application';

class BimfaceEngine {
    constructor() {
        this._app = new BimfaceApplication();
    }

    get app() {
        return this._app;
    }

    boot() {
        return this._app.init();
    }

    run() {
        this._app.run();
    }

    exit() {
        this._app.exit();
    }
}

let bfEngine = new BimfaceEngine();

export { bfEngine }