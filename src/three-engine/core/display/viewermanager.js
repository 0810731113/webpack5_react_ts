class ViewerManager {
    constructor() {
        this._viewers = new Map();
    }
    
    init() {
    }

    destroy() {
    }

    get viewers() {
        return this._viewers;
    }

    set suspend(p) {
        this._viewers.forEach(itr => {
            itr.suspend = p;
        });
    }

    getActiveView() {
        let target = null;
        for (let v of this._viewers) {
            let viewer = v[1];
            if (viewer.isActive) {
                target = viewer;
                break;
            }
        }
        return target;
    }
}

export { ViewerManager }