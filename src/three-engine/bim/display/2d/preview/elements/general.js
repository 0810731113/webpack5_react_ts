import { ElementPreview2d } from './element';
import { SnapTypes } from 'three-engine/bim/snap/type';

class GeneralPreview2d extends ElementPreview2d {
    constructor() {
        super();
    }

    draw(x, y) {
        this._createSprite(x, y, SnapTypes.General);
    }
}

export { GeneralPreview2d }