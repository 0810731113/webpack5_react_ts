import { entityTypes } from './entitytypes';
import { EntitySet } from '../../design/model/objects/entityset';

class BuildinEntitySet extends EntitySet {
    constructor() {
        super(entityTypes.BuildinEntitySet);
    }

    static self(design) {
        return design.getBestEntity(entityTypes.BuildinEntitySet);
    }

    static kids(design) {
        return EntitySet.getKids(design, entityTypes.BuildinEntitySet);
    }

    static setup(design) {
        let p = BuildinEntitySet.self(design);
        if (!p) {
            p = new BuildinEntitySet();
            design.addEntity(p);
        }
        return p;
    }

    stageChange() {
        this._entities.forEach(itr => {
            itr.stageChange();
        });
        super.stageChange();
    }

    lookup(id) {
        let buildinentity = null;
        for (let i = 0; i < this._entities.length; i++) {
            let ent = this._entities[i];
            if (ent.id == id) {
                buildinentity = ent;
                break;
            }
        }
        return buildinentity;
    }

    add(ent) {
        if (this.lookup(ent.id) == null) {
            ent.design = this.design;
            this._entities.push(ent);
            ent.stageChange();
        }
    }

    onLoaded(){
        
    }

    serializedMetaData() {
        return {
            className: 'BuildinEntitySet',
            schemaVersion: 0
        };
    }

    static make() {
        let p = new BuildinEntitySet();
        return p;
    }
}

export { BuildinEntitySet }