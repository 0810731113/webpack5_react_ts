import { gdcDbConnector } from './dbconnector';
import Entity from '../../core/model/entity';
import { entityTypes } from '../../core/model/entitytypes';
import { Element } from './element';

class Model extends Entity {
    constructor() {
        super(entityTypes.Model);
        this._elements = new Map();
        this._comps = new Map();
        this._version = null;
    }

    get version() {
        return this._version;
    }

    load() {
        this._elements.clear();
        this._comps.clear();
        return new Promise((resolve, reject) => {
            gdcDbConnector.getLatestVersion({ modelId: this.id }).then((itr => {
                let data = itr.data;
                this._version = data.modelVersion;
                this._loadElements().then(() => {
                    resolve();
                }).catch(err => reject(err));
            }));
        });
    }

    addComp(p) {
        this._comps.set(p.id, p);
    }

    delComp(p) {
        this._comps.delete(p.id);
    }

    findComp(id) {
        return this._comps.get(id);
    }

    add(element) {
        this._elements.set(element.id, element);
        element.parent = this;
    }

    del(element) {
        this._elements.delete(element.id);
    }

    find(id) {
        return this._elements.get(id);
    }

    onFrameRendered() {
        this._elements.forEach(itr => {
            itr.onFrameRendered();
        });
    }

    _loadElements() {
        return new Promise((resolve, reject) => {
            if (!this._version) {
                resolve();
            }
            let branch = 'eb34606d-81c5-4da4-92b8-1af5e9e08a9d';
            gdcDbConnector.getModelElements({ branch: branch, model: this.id, version: this._version }).then((res) => {
                let data = res.data;
                data.forEach(itr => {
                    let element = new Element();
                    element.schemaType = itr.schemaType;
                    this.add(element);
                    element.load(itr).then(() => {
                        resolve();
                    }).catch(err => reject(err));
                });
            });
        });
    }
}

export { Model }