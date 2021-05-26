import { Viewable } from '../../../../core/display/viewable';
import { Body } from '../../../../core/display/brep/body';

class Element3d extends Viewable {
    constructor(scene, context, entity) {
        super(scene, context, entity);
    }

    _onCreateSceneNode() {
        let comp = this._entity.comp;
        let body = new Body(this._scene, this._context, comp.body);
        body.createSceneNode();
        this._node.add(body.node);
    }
}

export { Element3d }