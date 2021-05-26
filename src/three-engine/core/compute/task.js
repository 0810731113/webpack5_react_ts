import { Uuid } from '../dbstorage/uuid';

class ComputeTask {
    constructor() {
        this._uuid = Uuid.generateUUID();
    }

    get id() {
        return this._uuid;
    }

    compute(context) {

    }

    getInputs() {

    }

    getOutputs() {

    }

    canMergeWith(task) {
        return false;
    }
}

export default ComputeTask;