import Change from './change'
import EntityChange from './entitychange'
import EntityMap from '../dbstorage/entitymap';

class ModelChange extends Change {
    constructor(modelview, memento, beginSnapshot) {
        super();
        this._modelview = modelview;
        this._memento = memento;
        this._changes = [];
        this._changedEntities = new Set();
        this._beginSnapshot = beginSnapshot;
        this._endSnapshot = new EntityMap();
    }

    set beginSanpshot(val) {
        this._beginSnapshot = val;
    }

    get endSnapshot() {
        return this._endSnapshot;
    }

    entityChanged(entity) {
        if(this._changedEntities.has(entity) == false) {
            this._changedEntities.add(entity);
            const change = new EntityChange(entity, this._memento);
            this._changes.push(change);
        }
    }

    commit() {
        const snapshot = this._modelview.createSnapshot();
        snapshot.forEach(entity => {
            this._endSnapshot.set(entity.entityId, entity);
            //Handle the newly created entities
            if(this._beginSnapshot.has(entity.entityId) == false) {
                this._memento.set(entity.revId, JSON.stringify(entity.serialize()));
            }
        })

        for(let i = 0; i < this._changes.length; i++) {
            this._changes[i].preCommit(this._endSnapshot);
        }
        for(let i = 0; i < this._changes.length; i++) {
            this._changes[i].commit(this._endSnapshot);
        }
        for(let i = 0; i < this._changes.length; i++) {
            this._changes[i].postCommit(this._endSnapshot);
        }
    }

    abort() {
        for(let i = this._changes.length - 1; i >= 0 ; i--) {
            this._changes[i].preAbort(this._beginSnapshot);
        }
        for(let i = this._changes.length - 1; i >= 0 ; i--) {
            this._changes[i].abort(this._beginSnapshot);
        }
        for(let i = this._changes.length - 1; i >= 0 ; i--) {
            this._changes[i].postAbort(this._beginSnapshot);
        }
        this._changes = [];
        this._changedEntities.clear();
    }

    undo() {
        for(let i = this._changes.length - 1; i >= 0 ; i--) {
            this._changes[i].preUndo(this._beginSnapshot);
        }
        for(let i = this._changes.length - 1; i >= 0 ; i--) {
            this._changes[i].undo(this._beginSnapshot);
        }
        for(let i = this._changes.length - 1; i >= 0 ; i--) {
            this._changes[i].postUndo(this._beginSnapshot);
        }
    }

    redo() {
        for(let i = 0; i < this._changes.length; i++) {
            this._changes[i].preRedo(this._endSnapshot);
        }
        for(let i = 0; i < this._changes.length; i++) {
            this._changes[i].redo(this._endSnapshot);
        }
        for(let i = 0; i < this._changes.length; i++) {
            this._changes[i].postRedo(this._endSnapshot);
        }
    }

}

export default ModelChange;