import Entity from '../../core/model/entity';
import { Model } from './model';
import { gdcDbConnector } from './dbconnector';
import { entityTypes } from '../../core/model/entitytypes';

class Folder extends Entity {
    constructor() {
        super(entityTypes.Folder);
        this._models = new Map();
    }

    load() {
        this._models.clear();
        return new Promise((resolve, reject) => {
            gdcDbConnector.getModelsByFolder({ folderId: this.id }).then((res) => {
                let data = res.data;
                data.forEach(itr => {
                    let model = new Model();
                    model.id = itr.id;
                    this.add(model);
                    model.load().then(() => {
                        resolve();
                    }).catch(err => reject(err));
                });
            });
        });
    }

    add(model) {
        this._models.set(model.id, model);
    }

    del(model) {
        this._models.delete(model.id);
    }

    find(id) {
        return this._models.get(id);
    }

    onFrameRendered() {
        this._models.forEach(itr => {
            itr.onFrameRendered();
        });
    }
}

export { Folder }