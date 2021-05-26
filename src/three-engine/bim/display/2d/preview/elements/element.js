import * as THREE from 'three'
class ElementPreview2d extends THREE.Object3D {
    constructor() {
        super();
        this._viewer = null;
        this._textures = null;
        this._useLength = false;
        this._pl = null;
        this._scale = 250;
    }

    set textures(p) {
        this._textures = p;
    }

    set viewer(p) {
        this._viewer = p;
    }

    set useLength(p) {
        this._useLength = p;
    }

    set pl(p) {
        this._pl = p;
    }

    draw(x, y) {
    }

    updateMatrixWorld() {
        super.updateMatrixWorld();
        let s = this._viewer.pixelLength() * this._scale / this._pl;
        let meshes = this._getMeshes(this);
        meshes.forEach(itr => {
            if (itr instanceof THREE.Sprite) {
                itr.scale.setScalar(s);
            }
            else {
                itr.scale.setScalar(s);
            }
        });
    }

    _createSprite(x, y, img) {
        let texture = this._getTexture(img);
        let mat = new THREE.SpriteMaterial({
            depthTest: false,
            depthWrite: false,
            side: THREE.DoubleSide,
            map: texture });
        let sprite = new THREE.Sprite(mat);
        this.add(sprite);
        sprite.scale.set(this._scale, this._scale, 1);
        sprite.position.x = x;
        sprite.position.y = y;
        return sprite;
    }

    _getTexture(type) {
        return this._textures.get(type);
    }

    _drawDashline(arr) {
        let polygon = [];
        arr.forEach(itr => {
            polygon.push(itr.x);
            polygon.push(itr.y);
            polygon.push(itr.z);
        });
        let geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(polygon, 3));
        let mat = new THREE.LineDashedMaterial({ 
            depthTest: false,
            depthWrite: false,
            side: THREE.DoubleSide,
            fog: false,
            color: 0xff0000, 
            linewidth: 1, 
            dashSize: 600, 
            gapSize: 400, 
            transparent: true,
            opacity: 0.3
        });

        let line = new THREE.Line(geo, mat);
        line.computeLineDistances();
        line.position.z = 1;
        return line;
    }

    _getMeshes(node) {
        let meshes = [];
        if (!node) {
            return;
        }
        node.traverse(itr => {
            if (itr instanceof THREE.Mesh || itr instanceof THREE.Sprite) {
                meshes.push(itr);
            }
        });
        return meshes;
    }
}

export { ElementPreview2d }