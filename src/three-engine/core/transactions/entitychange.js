import Change from './change'

class EntityChange extends Change {
    constructor(entity, memento) {
        super();
        this._entity = entity;
        this._memento = memento;
        this._oldRevId = this._entity.revId;
        this._entity.revise();
        this._newRevId = this._entity.revId;
    }

    get entity() {
        return this._entity;
    }

    deserialize(memento, entityMap) {
        const jsonMemento = JSON.parse(memento);
        this._entity.deserialize(jsonMemento.data, jsonMemento.metaData);
        this._entity.revId = jsonMemento.revId;
        this._entity.onFixLink(entityMap);
    }

    commit(entityMap) {
        if(entityMap.has(this._entity.entityId)) {
            this._memento.set(this._newRevId, JSON.stringify(this._entity.serialize()));
            const entBeforeStg = this._memento.get(this._oldRevId);
            const entAfterStg = this._memento.get(this._newRevId);
            const templateTypes = ['Element', 'Unit', 'Apartment'];
            const ingore = ['face', 'edge', 'body', 'mesh'];
            if(!this._entity.type || (templateTypes.indexOf(this._entity.type) > -1)
                || ingore.indexOf(Symbol.keyFor(this._entity.type)) != -1){
                return;
            }
            if(!entBeforeStg){
                return;
            }
            this._diff(entBeforeStg, entAfterStg, this._entity);
        }
    }

    _diff(entBeforeStg, entAfterStg, entity){
        const before = entBeforeStg.split(',');
        const after = entAfterStg.split(',');
        before.splice(0,1);
        after.splice(0,1);

        if(this.isArrayEquals(before, after)){
            //console.warn('对象未被改变', entity);
        }
    }

    isArrayEquals(array1,array2) {
        return array1.length==array2.length && array1.every((value, key) => {
            return value === array2[key];
        });
    }


    postCommit() {

    }

    abort(entityMap) {
        if(entityMap.has(this._entity.entityId)) {
            const memento = this._memento.get(this._oldRevId);
            this.deserialize(memento, entityMap);
        }
    }

    postAbort() {
        this._entity.onPostLoad({
            transaction:true,
            postAbort:true
        });
    }

    preUndo() {
        
    }

    undo(entityMap) {
        if(entityMap.has(this._entity.entityId)) {
            const memento = this._memento.get(this._oldRevId);
            this.deserialize(memento, entityMap);
        }
    }

    postUndo() {
        this._entity.onPostLoad({
            transaction:true,
            postUndo:true
        });
    }

    redo(entityMap) {
        if(entityMap.has(this._entity.entityId)) {
            const memento = this._memento.get(this._newRevId);
            this.deserialize(memento, entityMap);
        }
    }

    postRedo() {
        this._entity.onPostLoad({
            transaction:true,
            postRedo:true
        });
    }
}

export default EntityChange;