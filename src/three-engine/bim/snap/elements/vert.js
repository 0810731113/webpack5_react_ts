import { SnapTypes } from '../type';
import { Element2d } from './element';

class VertSnap2d extends Element2d {
    constructor() {
        super();
        this._type = SnapTypes.Vert;
        this._priority = 0;
    }

    snap(pos) {
        this._snappedPoint = null;
        let MINDIST = this.MINDIST;
        let xs = this._data.xs;
        let arr = [...xs];
        if (this._data.base) {
            arr.push(this._data.base.x);
        }
        arr.forEach(itr => {
            let dist = Math.abs(pos.x - itr);
            dist = this._toPixel(dist);
            if (dist < MINDIST) {
                MINDIST = dist;
                this._snappedPoint = { x: itr, y: null };
            }
        });
        return (null != this._snappedPoint);
    }
}

export { VertSnap2d }