import { Element2d } from './element';
import { SnapTypes } from '../type';

class HorzSnap2d extends Element2d {
    constructor() {
        super();
        this._type = SnapTypes.Horz;
        this._priority = 0;
    }

    snap(pos) {
        this._snappedPoint = null;
        let MINDIST = this.MINDIST;
        let ys = this._data.ys;
        let arr = [...ys];
        if (this._data.base) {
            arr.push(this._data.base.y);
        }
        arr.forEach(itr => {
            let dist = Math.abs(pos.y - itr);
            dist = this._toPixel(dist);
            if (dist < MINDIST) {
                MINDIST = dist;
                this._snappedPoint = { x: null, y: itr };
            }
        });
        return (null != this._snappedPoint);
    }
}

export { HorzSnap2d }