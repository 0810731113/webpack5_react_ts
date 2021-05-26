import Curve from './curve';
import curveTypes from './curvetypes';
import * as THREE from 'three';
const TOLERANCE = 1.0e-1;

class Point extends Curve {
    constructor(x, y, z) {
        super(curveTypes.Point);
        this.x = x;
        this.y = y;
        this.z = z;
    }

    get asVector() {
        return new THREE.Vector3(this.x, this.y, this.z);
    }

    distanceTo(pt) {
        return Math.sqrt((this.x - pt.x)*(this.x - pt.x) 
        + (this.y - pt.y)*(this.y - pt.y) 
        + (this.z - pt.z)*(this.z - pt.z));
    }

    distanceTo2d(pt) {
        return Math.sqrt((this.x - pt.x)*(this.x - pt.x)
            + (this.y - pt.y)*(this.y - pt.y));
    }

    add(offset) {
        this.x += offset.x;
        this.y += offset.y;
        this.z += offset.z;
        return this;
    }

    subtract(offset) {
        this.x -= offset.x;
        this.y -= offset.y;
        this.z -= offset.z;
        return this;
    }

    isEqualTo(p) {
        return this.distanceTo(p) < TOLERANCE;
    }

    clone() {
        return new Point(this.x, this.y, this.z);
    }

    toJson(){
        let jsonObj = {};
        jsonObj.x = this.x;
        jsonObj.y = this.y;
        jsonObj.z = this.z;
        let jsonStr = JSON.stringify(jsonObj);
        return JSON.parse(jsonStr);
    }
}

export default Point;