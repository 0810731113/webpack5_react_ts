import * as THREE from 'three'

class RayPicker {

    constructor(context) {
        this._context = context;
        this._raycaster = new THREE.Raycaster();
        this._raycaster.params.Line.threshold = 100;
        this._meshes = [];
        this._viewables = new Map();
    }

    get linePrecision() {
        return this._raycaster.params.Line.threshold;
    }
    
    set linePrecision(p) {
    }

    addViewable(viewable) {
        let node = viewable.node;
        if (!node) {
            return;
        }
        this.delViewable(viewable);
        node.traverse(itr => {
            if (this._pickable(itr)) {
                this._addMesh(itr, viewable);
            }
        });
    }

    delViewable(viewable) {
        let node = viewable.node;
        if (!node) {
            return;
        }
        const toBeDeleted = [];
        this._viewables.forEach((v, k) => {
            if (v == viewable) {
                toBeDeleted.push(k);
            }
        });
        toBeDeleted.forEach(mesh => {
            this._delMesh(mesh);
        })
    }

    pick(ptScreen, single, filter) {
        let pl = this._context.viewer.pixelLength();
        this._raycaster.params.Line.threshold = pl * 3;
        let camera = this._context.camera;
        this._raycaster.setFromCamera(ptScreen, camera);
        let intersects = [];
        let ents = this._raycaster.intersectObjects(this._meshes);
        this._sort(ents);
        ents.forEach(itr => {
            let viewable = this._viewables.get(itr.object);
            if (viewable && viewable.pickable()) {
                if (filter && !filter.accept(viewable)) {
                    return;
                }

                intersects.push(itr);
            }
        });

        let infos = [];
        if (intersects.length > 0) {
            if (single) {
                let info = this._pickInfo(intersects[0]);
                infos.push(info);
            } else {
                intersects.forEach(itr => {
                    let info = this._pickInfo(itr);
                    if (itr.distance > 0.1)
                        infos.push(info);
                });
            }
        }
        return infos;
    }

    destroy() {
        this._meshes = [];
        this._viewables.clear();
    }

    _addMesh(mesh, viewable) {
        if (!mesh) {
            return;
        }
        this._meshes.push(mesh);
        this._viewables.set(mesh, viewable);
    }

    _delMesh(mesh) {
        if (!this._meshes) {
            return;
        }
        var idx = this._meshes.indexOf(mesh);
        if (idx > -1) {
            this._meshes.splice(idx, 1);
            this._viewables.delete(mesh);
        }
    }

    _sort(ents) {
        ents.sort((a, b) => {
            let tolerance = 1e-5;
            let dist = a.distance - b.distance;
            if (Math.abs(dist) > tolerance) {
                return dist;
            }
            if (a.object && b.object) {
                let s1 = a.object.renderOrder || 0;
                let s2 = b.object.renderOrder || 0;
                if (s1 != s2) {
                    return s2 - s1;
                }
            }
            return dist;
        });
    }

    _pickInfo(ent) {
        let info = {};
        info.meshId = ent.object.uuid;
        info.viewable = this._viewables.get(ent.object);
        info.point = ent.point;
        info.dist = ent.distance;
        info.object = ent.object;
        return info;
    }

    _pickable(node) {
        if (node.tag === 'ng') {
            return false;
        }
        return (node instanceof THREE.Mesh || node instanceof THREE.Sprite || node instanceof THREE.Line);
    }
}

export { RayPicker }