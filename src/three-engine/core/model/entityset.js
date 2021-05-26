import Entity from './entity';
import { DirtyType } from '../display/dirtytype';

class EntitySet extends Entity {
    constructor(type) {
        super(type);
        this._entities = [];
    }

    static getKids(design, type) {
        let s = design.getBestEntity(type);
        return s ? s.entities : [];
    }

    isEmpty() {
        return (this._entities.length < 1);
    }

    get entities() {
        return this._entities;
    }

    addTransient(entity) {
        if(!entity){
            return;
        }
        this._entities.push(entity);
        if (!entity.design) {
            entity.design = this._design;
        }
        entity.parent = this;
        entity.notifyAdded();
    }

    delTransient(entity) {
        if (!entity) {
            return;
        }
        let idx = this._entities.indexOf(entity);
        if (idx > -1) {
            this._entities.splice(idx, 1);
        }
        entity.notifyRemoved();
    }

    clearTransient() {
        for (let i = this._entities.length - 1; i >= 0; i--) {
            this.delTransient(this._entities[i]);
        }
    }

    add(entity) {
        if(!entity){
            console.error('entity undefined');
            return;
        }
        this._entities.push(entity);
        if (!entity.design) {
            entity.design = this._design;
        }
        entity.parent = this;
        entity.stageChange();
        this.stageChange();
        entity.notifyAdded();
        // const change = new EntitySetChange(this);
        // change.entityAdded(entity);
        // TransactionManager.registerChange(change);
    }

    insert(entity,targetIndex) {
        if(!entity){
            console.error('entity undefined');
            return;
        }
        if(targetIndex<0||targetIndex == undefined) {
            this._entities.push(entity);
        }
        else{
            this._entities.splice(targetIndex,0, entity);
        }
        if (!entity.design) {
            entity.design = this._design;
        }
        entity.parent = this;
        entity.stageChange();
        this.stageChange();
        entity.notifyAdded();
        // const change = new EntitySetChange(this);
        // change.entityAdded(entity);
        // TransactionManager.registerChange(change);
    }

    indexOf(entity){
        return this._entities.indexOf(entity);
    }

    del(entity) {
        if (!entity) {
            return;
        }
        let idx = this._entities.indexOf(entity);
        if (idx > -1) {
            this._entities.splice(idx, 1);
        }
        entity.stageChange();
        this.stageChange();
        entity.notifyRemoved();
        // const change = new EntitySetChange(this);
        // change.entityRemoved(entity);
        // TransactionManager.registerChange(change);
        entity.onRemoved();
    }

    clear() {
        for (let i = this._entities.length - 1; i >= 0; i--) {
            this.del(this._entities[i]);
        }
    }

    find(id) {
        return this._entities.find((itr) => (itr.id == id));
    }

    frameRendered() {
        this._entities.forEach(itr => {
            itr.dirty = DirtyType.Nothing;
            if(itr.body){
                itr.body.dirty = DirtyType.Nothing;
            }
            itr.frameRendered();
        });
    }

    serializedData() {
        let obj = super.serializedData();
        return Object.assign(obj, {
            entities: this._entities
        });
    }

    onLoaded() {
        super.onLoaded();
        this._onDisplay();
        this._entities.forEach(itr => {
            if(itr){
                itr.parent = this;
                itr.design = this._design;
                itr.notifyAdded();
            }else{
                console.error('entity undefined');
            }
        });
    }

    onLinkedEntities() {
        let arr = super.onLinkedEntities();
        arr.push(...this._entities);
        return arr;
    }

    onFixLink(entityMap) {
        super.onFixLink(entityMap);
        let arr = this._entities;
        this._entities = [];
        arr.forEach(itr => {
            let entity = entityMap.get(itr);
            if(entity) this._entities.push(entity);
        });
    }

    deserialize(data) {
        super.deserialize(data);
        this._entities = data.entities;
    }

    getViewableEntities() {
        let arr = [];
        arr.push(...this._entities);
        return arr;
    }

    _onDisplay() {
    }
}

export { EntitySet }