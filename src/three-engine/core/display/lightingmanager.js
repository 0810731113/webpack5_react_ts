import * as THREE from 'three'

class LightingManager {
    constructor() {
    }

    setupLighting(scene) {

        let L1 = new THREE.DirectionalLight(0xffffff);
        L1.intensity = 0.2;
        L1.position.set(-10000, 0, 20000);
        L1.position.setLength(30000);
        scene.add(L1);

        let L2 = new THREE.DirectionalLight(0xffffff);
        L2.intensity = 0.2;
        L2.position.set(10000, 0, 20000);
        L2.position.setLength(30000);
        scene.add(L2);

        let L3 = new THREE.DirectionalLight(0xffffff);
        L3.intensity = 0.05;
        L3.position.set(0, 0, -10000);
        L3.position.setLength(30000);
        scene.add(L3);

        let hemi = new THREE.HemisphereLight(0xffffff, 0xffffff);
        hemi.color.set(0xffffff);
        hemi.groundColor.set(0xffffff);
        hemi.intensity = 0.6;
        scene.add(hemi);
    }
}

export { LightingManager }