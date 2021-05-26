import * as THREE from 'three';
class SVGText{
    constructor(text) {
        this._text = text;
        this._mtxLocal = new THREE.Matrix4();
        this._color = 'rgb(0,0,0)';
        this._size = 1.5;
    }

    get text() {
        return this._text;
    }

    set text(text) {
        this._text = text;
    }

    set mtxLocal(local) {
        this._mtxLocal = local;
    }

    get mtxLocal() {
        return this._mtxLocal;
    }

    get size() {
        return this._size;
    }
    get color() {
        return this._color;
    }

    set color(value) {
        this._color = value;
    }

    set size(value) {
        this._size = value;
    }

}

export { SVGText }
