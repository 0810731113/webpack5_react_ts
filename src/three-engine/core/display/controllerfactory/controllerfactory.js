class ControllerFactory {
    constructor() {
        this._type = null;
    }

    get type() {
        return this._type;
    }

    make(data) {
        return null;
    }
}

export { ControllerFactory }