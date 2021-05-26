import * as THREE from 'three'

class AxisMark extends THREE.Object3D {
    constructor(viewer) {
        super();
        this._viewer = viewer;
        this._pl = viewer.pl;
        this._color = 0x00ffff;
    }

    set color(p) {
        this._color = p;
    }

    draw() {
        let s = this.size * 12;
        let geo = new THREE.CylinderGeometry(s, s, 32, 32, 32);
        let c1 = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: this._color }));
        let c2 = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: this._color }));
        c1.rotateZ(Math.PI / 4);
        c2.rotateZ(-Math.PI / 4);
        this.add(c1);
        this.add(c2);
    }

    get size() {
        return this._pl;
    }

    updateMatrixWorld() {
        super.updateMatrixWorld();
        let s = this._viewer.pixelLength() / this._pl;
        this.children.forEach(itr => {
            itr.scale.setScalar(s);
            itr.position.copy(new THREE.Vector3(0, 0, 0));
        });
    } 
}

export { AxisMark }