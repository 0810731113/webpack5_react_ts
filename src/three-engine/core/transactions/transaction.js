import ModelChange from './modelchange';

class Transaction {
    constructor(modelview, memento, beginSnapshot) {
        this._modelview = modelview;
        this._memento = memento;
        this._beginSnapshot = beginSnapshot;
        this.init();
    }

    get beginSnapshot() {
        return this._beginSnapshot;
    }

    set beginSnapshot(val) {
        this._beginSnapshot = val;
        this._modelChange.beginSanpshot = val;
    }

    get endSnapshot() {
        return this._modelChange.endSnapshot;
    }

    init() {
        this._started = false;
        this._committed = false;
        this._changes = [];
        this._modelChange = new ModelChange(this._modelview, this._memento, this._beginSnapshot);
        this._changes.push(this._modelChange);
    }

    get name() {
        return this._name;
    }

    set name(val) {
        this._name = val;
    }

    start() {
        this._started = true;
    }

    isStarted() {
        return this._started;
    }

    isCommitted() {
        return this._committed;
    }

    isValid() {
        if(this._changes.length == 1) {
            if(this._modelChange._changes.length == 0) {
                return false;
            }
        }

        return true;
    }

    commit() {
        for(let i = 0; i < this._changes.length; i++) {
            this._changes[i].preCommit();
        }
        for(let i = 0; i < this._changes.length; i++) {
            this._changes[i].commit();
        }
        for(let i = 0; i < this._changes.length; i++) {
            this._changes[i].postCommit();
        }

        this._committed = true;
    }

    abort() {
        for(let i = this._changes.length - 1; i >= 0 ; i--) {
            this._changes[i].preAbort();
        }
        for(let i = this._changes.length - 1; i >= 0 ; i--) {
            this._changes[i].abort();
        }
        for(let i = this._changes.length - 1; i >= 0 ; i--) {
            this._changes[i].postAbort();
        }
        this.init();
    }

    undo() {
        for(let i = this._changes.length - 1; i >= 0 ; i--) {
            this._changes[i].preUndo();
        }
        for(let i = this._changes.length - 1; i >= 0 ; i--) {
            this._changes[i].undo();
        }
        for(let i = this._changes.length - 1; i >= 0 ; i--) {
            this._changes[i].postUndo();
        }
    }

    redo() {
        for(let i = 0; i < this._changes.length; i++) {
            this._changes[i].preRedo();
        }
        for(let i = 0; i < this._changes.length; i++) {
            this._changes[i].redo();
        }
        for(let i = 0; i < this._changes.length; i++) {
            this._changes[i].postRedo();
        }
    }

    registerEntityChange(entity) {
        this._modelChange.entityChanged(entity);
    }

    registerChange(change) { 
        this._changes.push(change);
    }
}

export default Transaction;