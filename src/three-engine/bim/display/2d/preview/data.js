import { entityTypes } from 'three-engine/core/model/entitytypes';
import PreviewEntity from 'three-engine/core/model/previewentity';
import { SnapTypes } from 'three-engine/bim/snap/type';

class AxisLinePreviewData extends PreviewEntity {
    constructor() {
        super(entityTypes.AxisGridPreview);
        this._pivots = [];
        this._pendingPivot = null;
    }

    get pendingPivot() {
        return this._pendingPivot;
    }

    set pedingPivot(v) {
        this._pendingPivot = v;
    }

    addPivot(v) {
        this._pivots.push(v);
    }

    _loadTextures() {
        this._textures.clear();

        let snapImg = `${process.env.PUBLIC_URL}/assets/snap/snap.png`;
        let normalImg = `${process.env.PUBLIC_URL}/assets/snap/foot.png`;
        let footpointImg = `${process.env.PUBLIC_URL}/assets/snap/foot.png`;
        let midpointImg = `${process.env.PUBLIC_URL}/assets/snap/mid.png`;
        let endpointImg = `${process.env.PUBLIC_URL}/assets/snap/end.png`;
        let generalImg = `${process.env.PUBLIC_URL}/assets/snap/general.png`;
        let normal = this._loadTexture(normalImg);
        let seg = this._loadTexture(snapImg);
        let foot = this._loadTexture(footpointImg);
        let mid = this._loadTexture(midpointImg);
        let end = this._loadTexture(endpointImg);
        let gen = this._loadTexture(generalImg);
        this._textures.set(SnapTypes.None, normal);
        this._textures.set(SnapTypes.EndPoint, end);
        this._textures.set(SnapTypes.MidPoint, mid);
        this._textures.set(SnapTypes.FootPoint, foot);
        this._textures.set(SnapTypes.Segment, seg);
        this._textures.set(SnapTypes.General, gen);
    }
}

export { AxisLinePreviewData }