class Creator {
    constructor(scene, context) {
        this._scene = scene;
        this._context = context;
    }

    get scene() {
        return this._scene;
    }

    get context() {
        return this._context;
    }

    createViewable(entity) {
    }
}

export { Creator }