import * as THREE from 'three'

class InteractionPlane {
    constructor(normal, pos, camera) {
        this._plane = new THREE.Plane();
        this._raycaster = new THREE.Raycaster();
        this._camera = camera;
        this._plane.setFromNormalAndCoplanarPoint(normal, pos);
    }

    intersect(pt) {
        let intersection = new THREE.Vector3();
        this._raycaster.setFromCamera(pt, this._camera);
        this._raycaster.ray.intersectPlane(this._plane, intersection);
        return intersection;
    }
}

export { InteractionPlane }