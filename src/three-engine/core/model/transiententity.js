import { Uuid } from '../dbstorage/uuid';
import * as THREE from 'three'
import { DirtyType } from '../display/dirtytype';

class TransientEntity {
    constructor(type) {
        this._id = Uuid.generateUUID();
        this._type = type;
        this._dirty = DirtyType.All;
        this._mtxLocal = new THREE.Matrix4();
        this._design = null;
        this._vis = true;
    }

    get design() {
        return this._design;
    }

    set design(p) {
        this._design = p;
    }

    get vis() {
        return this._vis;
    }

    set vis(v) {
        this._vis = v;
    }

    get id() {
        return this._id;
    }

    get type() {
        return this._type;
    }

    set type(f) {
        this._type = f;
    }

    get dirty() {
        return this._dirty;
    }

    set dirty(f) {
        this._dirty = f;
    }

    set mtxLocal(local) {
        this._mtxLocal = local;
    }

    get mtxLocal() {
        return this._mtxLocal;
    }

    movable() {
        return false;
    }

    setPosition(pos) {
        this._mtxLocal.setPosition(new THREE.Vector3(pos.x, pos.y, pos.z));
        this.dirty = DirtyType.Transform;
    }

    onDelete(doc) {
    }
}

export { TransientEntity }