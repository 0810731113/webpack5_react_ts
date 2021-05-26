import Action from './action';
import * as THREE from 'three'
import TransactionManager from '../transactions/transactionmanager';

class CopyAction extends Action {
    constructor(controller) {
        super();
        this._controller = controller;
        this._started = false;
    }

    mouseMove(viewer, e) {
        if (this._started) {
            this._controller.onDragmove(e);
        }
        else {
            // let pos = viewer.screen2model({ x: e.clientX, y: e.clientY });
            // const origialPos = this._controller.entity.entity.getPosition();
            // this._controller.entity.entity.setPosition({ x: pos.x, y: pos.y, z: origialPos.z });

            viewer.selector.do(this._controller.entity.entity, { viewable: this._controller.entity });
            this._controller.onDragstart(e);
            this._controller.offset = new THREE.Vector3(0, 0, 0);
            this._started = true;
        }
    }

    lMouseUp(viewer, e) {
        this._controller.onDragend(e);
        this.markFinished();
        this._started = false;
    }

    keyDown(viewer, e) {
        if (e.ctrlKey && e.keyCode == 86) {
            this._controller.onDragend(e);
            this.markFinished();
            this._started = false;
        }
    }
}

export { CopyAction }