import * as THREE from 'three'
import { ElementPreview2d } from './element';

class VertPreview2d extends ElementPreview2d {
    constructor() {
        super();
    }

    draw(x, y) {
        let arr = [new THREE.Vector3(x, -100000, 0), new THREE.Vector3(x, 100000, 0)];
        let line = this._drawDashline(arr);
        this.add(line);
    }
}

export { VertPreview2d }