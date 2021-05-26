import { ControllerFactoryTypes } from './type';
import { ControllerFactory } from './controllerfactory';
import { entityTypes } from '../../model/entitytypes';
import { ElementController3d } from '../../../bim/display/3d/objects/controller';

class ControllerFactory3d extends ControllerFactory {
    constructor() {
        super();
        this._type = ControllerFactoryTypes.Viewer3d;
    }

    make(data) {
        if (!data) {
            return null;
        }
        let p = null;
        switch (data.entitytype) {
            case entityTypes.Element:
                p = new ElementController3d();
                break;
        }
        return p;
    }
}

export { ControllerFactory3d }