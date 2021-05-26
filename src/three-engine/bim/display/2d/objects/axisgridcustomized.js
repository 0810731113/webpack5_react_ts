import * as THREE from 'three'
import { DirtyType } from 'three-engine/core/display/dirtytype';
import { Viewable } from 'three-engine/core/display/viewable';
import { AxisLine2d } from './axisline';
import { AxisMark } from './axismark';


class AxisGridCustomized2d extends Viewable {
    constructor(scene, context, entity) {
        super(scene, context, entity);
    }

    _onCreateSceneNode() {
        let arr = this._entity.getAxisLines();
        arr.forEach(itr => {
            let viewable = new AxisLine2d(this._scene, this._context, itr);
            viewable._onCreateSceneNode();
            viewable.applyMaterial('preview');
            this._node.add(viewable.node);
        });

        let mark = new AxisMark(this._context.viewer);
        mark.color = 0x13c2c2;
        mark.draw();
        this.node.add(mark);
        this._entity.dirty = DirtyType.Nothing;
    }

    drawOutline() {
    }
}

export { AxisGridCustomized2d }   