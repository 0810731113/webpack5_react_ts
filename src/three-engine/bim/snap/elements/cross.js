import { Element2d } from './element';
import { SnapTypes } from '../type';

class CrossSnap2d extends Element2d {
    constructor() {
        super();
        this._type = SnapTypes.Cross;
        this._priority = 2;
    }

    snap(pos) {
        this._snappedPoint = null;
        let MINDIST = this.MINDIST;
        let cs = this._data.cs;
        cs.forEach(itr => {
            let dist = pos.distanceTo(itr);
            dist = this._toPixel(dist);
            if (dist < MINDIST) {
                MINDIST = dist;
                this._snappedPoint = itr.clone();
            }
        });
        return (null != this._snappedPoint);
    }
}

export { CrossSnap2d }