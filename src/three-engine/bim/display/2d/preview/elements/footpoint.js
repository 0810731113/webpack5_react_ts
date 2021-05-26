import { ElementPreview2d } from './element';
import { SnapTypes } from 'three-engine/bim/snap/type';

class FootPointPreview2d extends ElementPreview2d {
    constructor() {
        super();
    }

    draw(x, y) {
        this._createSprite(x, y, SnapTypes.FootPoint);
    }
}

export { FootPointPreview2d }