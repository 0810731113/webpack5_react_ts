import { ViewerManager } from '../../core/display/viewermanager';
import { EventsManager } from '../../core/events/manager';
import { Viewer3d } from './3d/viewer';
import { WebCamViewer } from './webcam/webcamviewer';
import { ViewTypes } from '../viewtypes';
import { Events } from '../../core/events/events';

class BimViewerManager extends ViewerManager {
    constructor() {
        super();
    }

    init() {
        super.init();
        EventsManager.instance().listen(Events.canvasResized, this._onResize, this);
    }

    register(k, v) {
        this._viewers.set(k, v);
    }

    unregister(k) {
        this._viewers.delete(k);
    }

    destroy() {
        super.destroy();
        EventsManager.instance().unlisten(Events.canvasResized, this._onResize, this);
    }

    _onResize(domId) {
        let viewer = this._viewers.get(domId);
        if (viewer) {
            viewer.resize(domId);
        }
    }

    _setupViewers() {
        this._viewers.set(ViewTypes.web3d, new Viewer3d());
        this._viewers.set(ViewTypes.webcam, new WebCamViewer());
    }
}

export { BimViewerManager }