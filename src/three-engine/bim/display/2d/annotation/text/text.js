import { Annotaiton2d } from 'three-engine/core/display/annotation';
import { Application } from 'three-engine/core/application';
import { TextMesh2d } from '../../../../../core/display/textmesh';

class Text2d extends Annotaiton2d {
    constructor(scene, context, entity) {
        super(scene, context, entity);
    }

    _onCreateSceneNode() {
        let font = Application.instance().font;
        if (!font.loaded) {
            this._pending = true;
            return;
        }
        font = font.font;
        let gizmo = new TextMesh2d(this._context.viewer);
        gizmo.draw(font, this._entity.text);
        this.node.add(gizmo);
        this.applyTransform();
        this._pending = false;
    }
}

export { Text2d }