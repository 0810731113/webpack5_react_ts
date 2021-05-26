import * as THREE from 'three';

const materialUtils = {

    toThreeMaterial: function (materialData) {
        if (materialData == null || materialData == undefined) {
            return null;
        }

        const diffuseColor = new THREE.Color();
        const specularColor = new THREE.Color();
        let shininess = materialData.shininess || 0.0;

        diffuseColor.setRGB(materialData.diffuse[0], materialData.diffuse[1], materialData.diffuse[2]);
        specularColor.setRGB(materialData.specular[0], materialData.specular[1], materialData.specular[2]);

        if (shininess === 0.0) {
            specularColor.setRGB(0.0, 0.0, 0.0);
            shininess = 1;
        }

        let material = new THREE.MeshPhongMaterial({
            color: diffuseColor.getHex(),
            specular: specularColor.getHex(),
            shininess: shininess,
            side: THREE.DoubleSide,
            transparent: false,
            opacity: 1,
            flatShading: true
        });

        if (materialData.opacity !== 1.0) {
            material.opacity = materialData.opacity;
            material.transparent = true;
        }

        if (materialData.diffuseTexture != null && materialData.diffuseTexture != undefined) {
            material.map = materialData.diffuseTexture;
        }

        if (material.map) {
            material.color = new THREE.Color(1, 1, 1);
        }

        return material;
    }
}

export default materialUtils;