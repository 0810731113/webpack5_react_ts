import Entity from '../entity';
import { entityTypes } from '../entitytypes';
import { MeshData } from '../../../core/model/meshData'

class Edge extends Entity {
    constructor() {
        super(entityTypes.Edge);
        this._meshData = new MeshData();
    }

    get meshData() {
        return this._meshData;
    }

    set meshData(p) {
        this._meshData = p;
    }

    assign(source) {
        super.assign(source);

        this._meshData = source._meshData ? source._meshData.clone() : null;
    }

    copy() {
        const inst = new Edge();
        inst.assign(this);

        return inst;
    }
}

export { Edge }