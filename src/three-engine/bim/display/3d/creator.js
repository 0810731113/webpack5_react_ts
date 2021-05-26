import { Creator } from '../../../core/display/creator';
import { entityTypes } from '../../../core/model/entitytypes';
import { Element3d } from './objects/element';

class Creator3d extends Creator {
    constructor(scene, context) {
        super(scene, context);
    }

    createViewable(entity) {
        let p = null;
        switch (entity.type) {
            case entityTypes.Element:
                p = new Element3d(this._scene, this._context, entity);
                break;
        }
        return p;
    }
}

export { Creator3d }