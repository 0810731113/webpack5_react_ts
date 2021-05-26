import bimhomeConfig from '../../config/bimhomeconfig';
import { datasetapi } from '../bimmodel/datasetapi';

const ConvertStatus = {
    success: 'success',
    processing: 'processing',
    error: 'failed',
    crash: 'crash',
    nodata: 'nodata'
}

class PollingInstance {
    constructor(dsId, vsId, callback) {
        this._dsId = dsId;
        this._vsId = vsId;
        this._status = null;
        this._callback = callback;
        this._timeout = null;
    }

    get versionId() {
        return this._vsId
    }

    doPolling() {

        datasetapi.getProcessStatusForVersion(this._vsId).then((res) => {
            this._status = res.data;

            console.log(`${this._vsId} ${this._status}`)

            if (this._status === ConvertStatus.processing) {
                this._timeout = setTimeout(() => this.doPolling(), 5000)
            } else {
                this._callback()
            }
        })
    }

    stopPolling() {
        clearTimeout(this._timeout);
    }
}


const PollingQueue = {
    queue: [],

    insertQueue(dsId, vsId, callback) {
        if (!this.queue.find((el) => el.versionId === vsId)) {
            let instance = new PollingInstance(dsId, vsId, callback);
            this.queue.push(instance);

            instance.doPolling()
        }
    },

    clearQueue() {
        for (let q of this.queue) {
            q.stopPolling()
        }
        this.queue = [];
    }
}
export { ConvertStatus, PollingInstance, PollingQueue }