import { Creator } from '../../../core/display/creator';
import { entityTypes } from '../../../core/model/entitytypes';
import { Cube3d } from './objects/cube';

class CreatorWebCam extends Creator {
    constructor(scene, context) {
        super(scene, context);
    }

    createViewable(entity) {
        let p = null;
        switch (entity.type) {
            case entityTypes.Cube:
                p = new Cube3d(this._scene, this._context, entity);
                break;
        }
        return p;
    }
}

export { CreatorWebCam }