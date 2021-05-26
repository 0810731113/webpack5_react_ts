import { ControllerFactoryTypes } from './type';
import { ControllerFactory } from './controllerfactory';
import { entityTypes } from '../../model/entitytypes';
import { AxisLineController } from 'three-engine/bim/display/2d/objects/axislinecontroller';
import { AxisGridCustomizedController } from 'three-engine/bim/display/2d/objects/axisgridcustomizedcontroller';
import { OffsetPreviewController } from 'three-engine/bim/display/2d/preview/offsetpreviewcontroller';

class ControllerFactory2d extends ControllerFactory {
    constructor() {
        super();
        this._type = ControllerFactoryTypes.Viewer2d;
    }

    make(data) {
        if (!data) {
            return null;
        }
        let p = null;
        switch (data.entitytype) {
            case entityTypes.AxisLine:
                p = new AxisLineController();
                break;
            case entityTypes.AxisGridCustomized:
                p = new AxisGridCustomizedController();
                break;
            case entityTypes.OffsetPreview:
                p = new OffsetPreviewController();
                break;
        }
        return p;
    }
}

export { ControllerFactory2d }