import { ElementPreview2d } from './element';
import { SnapTypes } from 'three-engine/bim/snap/type';

class MidPointPreview2d extends ElementPreview2d {
    constructor() {
        super();
    }

    draw(x, y) {
        this._createSprite(x, y, SnapTypes.MidPoint);
    }
}

export { MidPointPreview2d }