import * as THREE from 'three'
import { Creator2d } from './creator';
import { Viewer2dBase } from '../base/viewer';

class Viewer2d extends Viewer2dBase {
    constructor() {
        super();
        this._type = '2d';
        this._pl = null;
        this._mark = null;
    }

    get pl() {
        return this._pl;
    }

    init(domId) {
        super.init(domId);
        this._creator = this._makeCreator();
        this.fitScreen();
        this._pl = this.pixelLength();
        this.linePickPrecision = 100;
        this._drawGrid();
    }

    _makeCreator() {
        return new Creator2d(this._scene, this._context);
    }

    _onDesignClosed() {
        super._onDesignClosed();
        this.fitScreen();
    }

    _getBoundingBox(node) {
        if (this._viewables.size > 0) {
            return super._getBoundingBox(node);
        }
        let s = 3500;
        return new THREE.Box3(new THREE.Vector3(-s, -s, 0), new THREE.Vector3(s, s, 0));
    }

    _getSceneBox() {
        return this._getBoundingBox(this._scene.foreground);
    }
}

export { Viewer2d }
