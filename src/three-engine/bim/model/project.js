import Entity from '../../core/model/entity';
import { Folder } from './folder';
import { gdcDbConnector } from './dbconnector';
import { entityTypes } from '../../core/model/entitytypes';

class Project extends Entity {
    constructor() {
        super(entityTypes.Project);
        this._folders = new Map();
    }

    load() {
        this._folders.clear();
        return new Promise((resolve, reject) => {
            gdcDbConnector.getFolderByProject({ projectId: this.id }).then((folders) => {
                folders.data.forEach(itr => {
                    let folder = new Folder();
                    folder.id = itr.id;
                    this.add(folder);
                    folder.load().then(() => {
                        resolve();
                    }).catch(err => reject(err));
                });
            });
        });
    }

    add(p) {
        this._folders.set(p.id, p);
    }

    del(p) {
        this._folders.delete(p.id);
    }

    find(id) {
        return this._folders.get(id);
    }

    onFrameRendered() {
        this._folders.forEach(itr => {
            itr.onFrameRendered();
        });
    }
}

export { Project }