class ManipulatorGizmoHolder {
    constructor() {
        this._geos = new Map();
    }

    addGeometry(name, geo) {
        this._geos.set(name, geo);
    }

    getGeometry(name) {
        return this._geos.get(name);
    }
}

const gizmoHolder = new ManipulatorGizmoHolder();
export { gizmoHolder }