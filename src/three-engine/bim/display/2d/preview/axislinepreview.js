import { DirtyType } from 'three-engine/core/display/dirtytype';
import { Viewable } from 'three-engine/core/display/viewable';
import { AxisLineGizmoCreator } from './gizmo/creator';
import { PreviewTypes } from 'three-engine/core/model/previewtypes';

class AxisLinePreview extends Viewable {
    constructor(scene, context, entity) {
        super(scene, context, entity);
        this._viewer = context.viewer;
        this._data = null;
        this._dim = null;
        this._snaps = null;
        this._handler = null;
    }

    set handler(p) {
        this._handler = p;
    }

    setData(data) {
        this._data = data;
        this._snaps = data.snaps;
        this._entity.dirty = DirtyType.All;
    }

    _onCreateSceneNode() { 
        if (!this._data) {
            return;
        }
        this._clearDim();
        this._dim = this._viewer.createPreview(PreviewTypes.AxisGridDim);
        this._dim.handler = this;
        let p0 = this._data.start;
        let p1 = this._data.end;
        let thickness = this._data.thickness;
        let gizmo = AxisLineGizmoCreator.make(this._viewer, this.drawTool, this._dim, this._snaps, thickness);
        gizmo.textures = this._entity.textures;
        gizmo.showDim = !this._data.hideDim;
        gizmo.dimEditable = this._data.dimEditable;
        gizmo.dragging = this._data.dragging;
        gizmo.draw(p0, p1);
        this._node.add(gizmo);
        this._entity.dirty = DirtyType.Nothing;
    }

    destroy() {
        super.destroy();
        this._clearDim();
    }

    _clearDim() {
        if (!this._dim) {
            return null;
        }
        this._dim.onPreDelete();
        this._context.viewer.delViewable(this._dim);
        this._dim = null;
    }

    onEdit(val, dir) {
        return this._handler ? this._handler.onEdit(val, dir) : false; 
    }
}

export { AxisLinePreview }