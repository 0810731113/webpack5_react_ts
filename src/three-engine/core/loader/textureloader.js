import * as THREE from 'three' 

class TextureLoader {
    constructor() {
    }

    load(img) {
        return new Promise((resolve, reject) => {
            let textureLoader = new THREE.TextureLoader();
            textureLoader.load(img,
                texture => {
                    texture.wrapS = THREE.RepeatWrapping;
                    texture.wrapT = THREE.RepeatWrapping;
                    texture.anisotropy = 16;
                    texture.needsUpdate = true;
                    let data = {};
                    data.image = img;
                    data.texture = texture;
                    resolve(data);
                },
                undefined,
                err => {
                    reject(err);
                });
        });
    }
}

export { TextureLoader }