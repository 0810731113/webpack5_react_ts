import { Creator } from '../../../core/display/creator';
import { entityTypes } from '../../../core/model/entitytypes';
import { AxisLine2d } from './objects/axisline';
import { AxisLinePreview } from './preview/axislinepreview';
import { AxisLinePreviewData } from './preview/data';
import { PreviewTypes } from 'three-engine/core/model/previewtypes';
import { DimPreview } from './preview/dim/dim';
import PreviewEntity from 'three-engine/core/model/previewentity';
import { AxisGridCustomized2d } from './objects/axisgridcustomized';
import { AxisGridDimPreview } from './preview/dim/axisgriddim';
import { OffsetPreview } from './preview/offsetpreview';

class Creator2d extends Creator {
    constructor(scene, context) {
        super(scene, context);
    }

    get scene() {
        return this._scene.foreground;
    }

    createViewable(entity) {
        let p = null;
        switch (entity.type) {
            case entityTypes.AxisLine:
                p = new AxisLine2d(this.scene, this._context, entity);
            break;
        }
        return p;
    }

    createPreview(type, data) {
        let p = null;
        switch (type) {
            case PreviewTypes.AxisLine:
                p = new AxisLinePreview(this.scene, this._context, new AxisLinePreviewData());
                break;
            case PreviewTypes.Dim:
                p = new DimPreview(this.scene, this._context, new PreviewEntity(entityTypes.DimPreview));
                break;
            case PreviewTypes.AxisGridCustomized:
                p = new AxisGridCustomized2d(this.scene, this._context, data);
                break;
            case PreviewTypes.AxisGridDim:
                p = new AxisGridDimPreview(this.scene, this._context, new PreviewEntity(entityTypes.AxisGridPreview));
                break;
            case PreviewTypes.OffsetPreview:
                p = new OffsetPreview(this.scene, this._context, data);
                break;
        }
        return p;
    }
}

export { Creator2d }