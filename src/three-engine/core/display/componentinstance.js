import { Viewable } from './viewable';
import { Body } from './brep/body';
import * as THREE from 'three'

class ComponentInstance extends Viewable {
    constructor(scene, context, entity) {
        super(scene, context, entity);
    }

    get box() {
        return this._box;
    }

    _onCreateSceneNode() {
        if (!this._entity) {
            return;
        }

        let comp = this._entity.comp;
        if (!comp || !comp.body) {
            return;
        }
        let body = new Body(this._scene, this._context, comp.body);
        body.createSceneNode();
        this._node.add(body.node);
    }
}

export { ComponentInstance }