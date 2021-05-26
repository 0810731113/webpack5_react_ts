class MeshStates {
    constructor() {
        this._map = new Map();
    }
    
    add(key, item) {
        this._map.set(key, item);
    }

    del(key) {
        this._map.delete(key);
    }

    get(key) {
        return this._map.get(key);
    }

    resetMesh() {
        this._map.forEach((v, k) => {
            v.meshes = [];
        });
    }

    getDefaultMaterial(key) {
        let s = this.get(key);
        return s.matNormal;
    }

    fillMeshes(key, arr) {
        let meshes = this.get(key).meshes;
        arr.forEach(itr => {
            meshes.push(itr);
        });
    }

    apply(state) {
        switch (state) {
            case 'normal':
                this._map.forEach((itr) => {
                    itr.meshes.forEach(mesh => {
                        mesh.material = itr.matNormal;
                    });
                });
                break;
            case 'selected':
                this._map.forEach((itr) => {
                    itr.meshes.forEach(mesh => {
                        mesh.material = itr.matSelected;
                    });
                });
                break;
            case 'highlight':
                this._map.forEach((itr) => {
                    itr.meshes.forEach(mesh => {
                        mesh.material = itr.matHL;
                    });
                });
                break;
            case 'drag':
                this._map.forEach((itr) => {
                    itr.meshes.forEach(mesh => {
                        mesh.material = itr.matDrag;
                    });
                });
                break;
            case 'preview':
                this._map.forEach((itr) => {
                    itr.meshes.forEach(mesh => {
                        mesh.material = itr.matPreview;
                    });
                });
                break;
        }
    }
}

class MeshState {
    constructor() {
        this._meshes = [];
        this._matNormal = null;
        this._matSelected = null;
        this._matHL = null;
        this._matPreview = null;
    }

    get meshes() {
        return this._meshes;
    }

    set meshes(p) {
        this._meshes = p;
    }

    get matNormal() {
        return this._matNormal;
    }

    set matNormal(p) {
        this._matNormal = p;
    }

    get matSelected() {
        return this._matSelected;
    }

    set matSelected(p) {
        this._matSelected = p;
    }

    get matHL() {
        return this._matHL;
    }

    set matHL(p) {
        this._matHL = p;
    }

    get matPreview() {
        return this._matPreview;
    }

    set matPreview(p) {
        this._matPreview = p;
    }
}

export { MeshStates, MeshState }