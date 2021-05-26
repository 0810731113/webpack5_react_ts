import * as THREE from 'three'
import { AxisLineSnapManager } from 'three-engine/bim/snap/axisline/manager';
import { Application } from 'three-engine/core/application';
import Command from 'three-engine/core/commands/command';
import { DirtyType } from 'three-engine/core/display/dirtytype';
import { PreviewTypes } from 'three-engine/core/model/previewtypes';
import { InsertAxisGridAction } from './insertaxisgridaction';

class InsertAxisGridCommand extends Command {
    constructor(entity, e) {
        super();
        this._name = 'InsertAxisGridCommand';
        this._event = e;
        this._entity = entity;
        this._snapMgr = null;
        this._viewer = Application.instance().viewers.get('grid');
    }

    get name() {
        return this._name;
    }

    execute() {
        super.execute();

        let viewer = this._viewer;
        let pos = viewer.screen2model({ x: this._event.clientX, y: this._event.clientY });
        this._entity.setPosition({ x: pos.x, y: pos.y, z: 0 });
        this._entity.dirty = DirtyType.All;

        let viewable = viewer.createPreview(PreviewTypes.AxisGridCustomized, this._entity);
        let controller = viewable.controller;
        this._init(controller, viewer);
        return new InsertAxisGridAction(controller, viewable, this._snapMgr);
    }
    
    onStart() {
        this._viewer.selector.ssClear();
        this._snapMgr = new AxisLineSnapManager();
        this._snapMgr.setup(this._viewer);
    }

    onEnd() {
        this._snapMgr = null;
    }

    _init(controller, viewer) {
        let viewable = controller.entity;
        let entity = viewable.entity;
        viewer.selector.do(entity, { viewable: viewable });
        viewer.context.needsRendering = true;
        entity.dirty = DirtyType.All;
        controller.onDragstart(this._event);
        controller.offset = new THREE.Vector3(0, 0, 0);
    }
}

export { InsertAxisGridCommand }