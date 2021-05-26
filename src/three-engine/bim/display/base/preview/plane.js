import * as THREE from 'three';

class Plane extends THREE.Mesh {
    constructor() {
        let geo = new THREE.PlaneBufferGeometry(10000000, 10000000, 2, 2);
        let mat = new THREE.MeshBasicMaterial({ visible: false, wireframe: true, side: THREE.DoubleSide, transparent: true, opacity: 0.1 });
        super(geo, mat);
    }

    updateMatrixWorld() {

        let unitX = new THREE.Vector3(1, 0, 0);
        let unitY = new THREE.Vector3(0, 1, 0);
        let unitZ = new THREE.Vector3(0, 0, 1);
        let tempVector = new THREE.Vector3();
        let dirVector = new THREE.Vector3();
        let alignVector = new THREE.Vector3();
        let tempMatrix = new THREE.Matrix4();
        let identityQuaternion = new THREE.Quaternion();
        let space = this.space;
        this.position.copy(this.worldPosition);
        if (this.mode === 'scale') space = 'local';
        unitX.set(1, 0, 0).applyQuaternion(space === 'local' ? this.worldQuaternion : identityQuaternion);
        unitY.set(0, 1, 0).applyQuaternion(space === 'local' ? this.worldQuaternion : identityQuaternion);
        unitZ.set(0, 0, 1).applyQuaternion(space === 'local' ? this.worldQuaternion : identityQuaternion);
        alignVector.copy(unitY);

        switch (this.mode) {
            case 'T':
            case 'scale':
                switch (this.axis) {
                    case 'X':
                        alignVector.copy(this.eye).cross(unitX);
                        dirVector.copy(unitX).cross(alignVector);
                        break;
                    case 'Y':
                        alignVector.copy(this.eye).cross(unitY);
                        dirVector.copy(unitY).cross(alignVector);
                        break;
                    case 'Z':
                        alignVector.copy(this.eye).cross(unitZ);
                        dirVector.copy(unitZ).cross(alignVector);
                        break;
                    case 'XY':
                        dirVector.copy(unitZ);
                        break;
                    case 'YZ':
                        dirVector.copy(unitX);
                        break;
                    case 'XZ':
                        alignVector.copy(unitZ);
                        dirVector.copy(unitY);
                        break;
                    case 'XYZ':
                    case 'E':
                        dirVector.set(0, 0, 0);
                        break;
                }
                break;
            case 'R':
            default:
                dirVector.set(0, 0, 0);
        }

        if (dirVector.length() === 0) {
            this.quaternion.copy(this.cameraQuaternion);
        } else {
            tempMatrix.lookAt(tempVector.set(0, 0, 0), dirVector, alignVector);
            this.quaternion.setFromRotationMatrix(tempMatrix);
        }

        THREE.Object3D.prototype.updateMatrixWorld.call(this);
    }
}

export { Plane }