import * as THREE from 'three'
import Entity from './entity';

class PreviewEntity extends Entity {
    constructor(type) {
        super(type);
        this._textures = new Map();
        this._loadTextures();

        this._host = null;
    }

    get host() {
        return this._host;
    }

    set host(value) {
        if (this._host && typeof (this._host) === 'object') {
            this.unsubscribeTo(this._host);
        }

        this._host = value;

        if (this._host && typeof (this._host) === 'object') {
            this.subscribeTo(this._host);
        }
    }

    get textures() {
        return this._textures;
    }

    serializedMetaData() {
        return {
            className: 'PreviewEntity',
            schemaVersion: 0
        };
    }

    stageChange() {
        super.stageChange();
    }

    onRemoved() {
        super.onRemoved();
        this.host = null;
    }

    _loadTextures() {
    }

    _loadTexture(img) {
        let loader = new THREE.TextureLoader();
        let texture = loader.load(img, (texture) => {
            texture.needsUpdate = true;
        });
        return texture;
    }
}

export default PreviewEntity;