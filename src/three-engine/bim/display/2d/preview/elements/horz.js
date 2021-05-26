import * as THREE from 'three'
import { ElementPreview2d } from './element';

class HorzPreview2d extends ElementPreview2d {
    constructor() {
        super();
    }

    draw(x, y) {
        let arr = [new THREE.Vector3(-100000, y, 0), new THREE.Vector3(100000, y, 0)];
        let line = this._drawDashline(arr);
        this.add(line);
    }
}

export { HorzPreview2d }