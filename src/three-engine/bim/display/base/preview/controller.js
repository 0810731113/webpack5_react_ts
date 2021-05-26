import { Controller } from '../../../../core/display/controller';
import { EventsManager } from '../../../../core/events/manager';
import { Events } from '../../../../core/events/events';
import TransactionManager from '../../../../core/transactions/transactionmanager'

class ManipulatorController extends Controller {
    constructor(entity) {
        super(entity);
        this._mesh = null;
        this._handler = null;
        this._dragStarted = false;
    }

    set handler(p) {
        this._handler = p;
    }

    onClick(e, param) {
    }

    onmouseup(e, param) {
        this._enableCamera(true);
        EventsManager.instance().dispatch(Events.prodTransformEnded);
    }

    onDragstart(e, param) {
        let mesh = this._pickedMesh(param);
        if (!mesh) {
            return;
        }
        this._dragStarted = true;
        this._entity.highlight(mesh); 
        this._enableCamera(false);
        this._handler.onMouseDown(e);
        TransactionManager.beginTransaction('Transform product');
    }

    onDragmove(e, param) {
        if (!this._dragStarted) {
            return;
        }
        this._handler.onMouseMove(e, param);
        this._entity.refresh();
    }

    onmousein(e, param) {
        this._enableCamera(false);
        let mesh = this._pickedMesh(param);
        if (!mesh) {
            return;
        }
        this._entity.highlight(mesh); 
    }
    
    onmouseout(e, param) {
        this._enableCamera(true);
        this._entity.unhighlight(this._mesh);
    }

    onDragend(e, param) {
        this._enableCamera(true);
        this._entity.unhighlight(this._mesh);
        this._handler.onMouseUp(e);
        this._dragStarted = false;
        this._entity.entity.stageChange();
        TransactionManager.endTransaction();
    }

    _pickedMesh(param) {
        if (!param) {
            return null;
        }
        this._meshId = param.meshId;
        this._mesh = this._entity.lookup(this._meshId);
        if (!this._mesh || !this._mesh.tag) {
            return null;
        }
        this._handler.setAxis(this._mesh.name);
        return this._mesh;
    }
}

export { ManipulatorController }