import * as THREE from 'three';
import { FileStoreCacher } from '../filestore/filestorecacher';

class VTextureCacher {
    constructor(){
        this._textureList = new Map();
    }

    LoadTexture(urlPath, fileUrlType){
        if(!this._textureList[urlPath]){
            return new Promise((resolve, reject) => {
                FileStoreCacher.GetFileLocalPath(urlPath, 'arraybuffer', fileUrlType).then(localTextureFile => {
                    new THREE.TextureLoader().load(localTextureFile, texture => {
                        texture.wrapS = THREE.RepeatWrapping;
                        texture.wrapT = THREE.RepeatWrapping;
                        texture.anisotropy = 16;
                        texture.needsUpdate = true;
                        this._textureList[urlPath] = texture;
                        resolve(texture);
                    });
                }).catch(reject);
            });
        } else {
            return new Promise((resolve, reject) => {
                resolve(this._textureList[urlPath]);
            });
        }
    }
}

var TextureCacher = new VTextureCacher();

export { TextureCacher }