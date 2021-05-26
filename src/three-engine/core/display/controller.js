import { EventsManager } from '../events/manager';
import { Events } from '../events/events';

class Controller {
    constructor() {
        this._entity = null;
    }

    get entity() {
        return this._entity;
    }

    setEntity(p) {
        this._entity = p;
        this._selector = this._entity.context.viewer.selector;
    }

    del() {
        Controller.delEntity(this);
    }

    onClick(e, param) {
        if (!param || !this._selector) {
            return;
        }
        param.event = e;
        this._selector.do(this._entity.entity, param);
    }

    onDblClick(e, param) {
    }

    static delEntity(p) {
        if (p) {
            let entity = p.entity.entity;
            entity.parent.del(entity);
        }
    }

    _isEntitySelected() {
        return this._entity.isSelected();
    }

    _enableCamera(enabled) {
        let args = {};
        args.enabled = enabled;
        EventsManager.instance().dispatch(Events.cameraStateChanged, args);
    }

    _cameraEnablePan(enabled){
        let args = {};
        args.enabled = enabled;
        EventsManager.instance().dispatch(Events.cameraEnablePan, args);
    }

    _applyMaterial(meshId, material) {
        let data = this.entity.getFaceByMeshId(meshId);
        let face = data.face;
        let node = data.node;
        if (!face || !node) {
            return;
        }
        
        face.materialId = material.id;
        this.entity.entity.stageChange();
        face.stageChange();

        this.entity.assignMaterial(node, material);
        return data;
    }


    onEdit(v) {
    }

    onTransformChanging(done) {
    }

    onmousedown(e, param) {
    }

    onmouseup(e, param) {
    }

    onRightClick(e) {
    }

    onDragstart(e, param) {
    }

    onDragmove(e, param) {
    }

    onDragend(e, param) {
    }

    onmousein(e, param) {
    }

    onmouseout(e, param) {
    }

    onhoverstart(e, param) {
    }

    onhovermove(e, param) {
    }

    onhoverend(e, param) {
    }

    onselected(param) {
    }
    
    ondeselected(param) {
    }

    onKeyup(e, top) {
        
    }

    onKeydown(e,top){

    }

    onApplyTexture(data, meshId) {
    }

    destroy() {
    }
}

export { Controller }