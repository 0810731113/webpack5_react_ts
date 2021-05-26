import Curve from './curve';
import curveTypes from './curvetypes';
import Point from './point';

class Line extends Curve {
    constructor(startPt, endPt) {
        super(curveTypes.Line);
        this._startPt = startPt;
        this._endPt = endPt;
    }

    translate(offset) {
        this._startPt.add(offset);
        this._endPt.add(offset);
    }

    get startPt() {
        return this._startPt;
    }

    set startPt(p) {
        this._startPt = p;
    }

    get endPt() {
        return this._endPt;
    }

    set endPt(p) {
        this._endPt = p;
    }

    clone() {
        return new Line(this._startPt, this._endPt);
    }

    static fromJson(js) {
        let s = js.startPt;
        let e = js.endPt;
        return new Line(new Point(s.x, s.y, s.z), new Point(e.x, e.y, e.z));
    }

    toJson(){
        let jsonObj = {};
        jsonObj.startPt = this._startPt.toJson();
        jsonObj.endPt = this._endPt.toJson();
        let jsonStr = JSON.stringify(jsonObj);
        return JSON.parse(jsonStr);
    }
}

export default Line;