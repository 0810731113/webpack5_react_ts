import { Element2d } from './element';
import { SnapTypes } from '../type';

class MidPointSnap2d extends Element2d {
    constructor() {
        super();
        this._type = SnapTypes.MidPoint;
        this._priority = 4;
    }

    snap(pos) {
        this._snappedPoint = null;
        let MINDIST = this.MINDIST;
        let ms = this._data.ms;
        ms.forEach(itr => {
            let dist = pos.distanceTo(itr);
            dist = this._toPixel(dist);
            if (dist < MINDIST) {
                if (this._isValidOrthoSnapping(itr.clone(), pos)) {
                    MINDIST = dist;
                    this._snappedPoint = itr.clone();
                }
            }
        });
        return (null != this._snappedPoint);
    }
}

export { MidPointSnap2d }