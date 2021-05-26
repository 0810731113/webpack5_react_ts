import Curve from './curve';
import curveTypes from './curvetypes';

class Circle extends Curve {
    constructor(centerPoint, hintPoint, normal) {
        super(curveTypes.Circle);
        this._centerPoint = centerPoint;
        this._hintPoint = hintPoint;
        this._normal = normal;
    }

    translate(offset) {
        this._center.add(offset);
        this._hintPoint.add(offset);
    }

    get centerPoint(){
        return this._centerPoint;
    }

    get hintPoint(){
        return this._hintPoint;
    }

    get normal(){
        return this._normal;
    }
}

export default Circle;