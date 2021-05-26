import { entityTypes } from 'three-engine/core/model/entitytypes';
import PreviewEntity from 'three-engine/core/model/previewentity';

class OffsetreviewData extends PreviewEntity {
    constructor() {
        super(entityTypes.OffsetPreview);
        this._pivot = null;
        this._pos = null;
        this._axisline = null;
        this._src = null;
    }

    get src()  {
        return this._src;
    }

    set src(p) {
        this._src = p;
    }

    get pivot() {
        return this._pivot;
    }

    set pivot(p) {
        this._pivot = p;
    }

    get pos() {
        return this._pos;
    }

    set pos(p) {
        this._pos = p;
    }

    get axisline() {
        return this._axisline;
    }

    set axisline(p) {
        this._axisline = p;
    }
}

export { OffsetreviewData }