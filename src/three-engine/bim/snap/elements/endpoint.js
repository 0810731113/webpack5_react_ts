import { Element2d } from './element';
import { SnapTypes } from '../type';

class EndPointSnap2d extends Element2d {
    constructor() {
        super();
        this._type = SnapTypes.EndPoint;
        this._priority = 3;
    }

    snap(pos) {
        this._snappedPoint = null;
        let MINDIST = this.MINDIST;
        let ps = this._data.ps;
        ps.forEach(itr => {
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

export { EndPointSnap2d }