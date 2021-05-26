import Transaction from './transaction'
import EntityMemento from './entitymemento'
import EntityMap from '../dbstorage/entitymap';
import { Application } from '../application';
import { EventsManager } from '../events/manager';
import { Events } from '../events/events';
import { PromiseManager } from './promisemanager';
import ComputeEngine from '../compute/engine'

const maximumUndoSteps = 50;
class TransactionSession {
    constructor(modelview) {
        this._modelview = modelview;
        const snapshot = modelview.createSnapshot();
        this._entityMemento = new EntityMemento(snapshot);
        this._undoList = [];
        this._redoList = [];
        this._isDoingUndoRedo = false;
        const beginSnapshot = new EntityMap();
        snapshot.forEach(entity => {
            beginSnapshot.set(entity.entityId, entity);
        })
        this._currentTransaction = new Transaction(this._modelview, this._entityMemento, beginSnapshot);
        this._promiseManager = new PromiseManager();
    }

    get hasTransaction() {
        return (this._undoList.length > 0 || this._redoList.length > 0);
    }

    isTransactionStarted() {
        return this._currentTransaction.isStarted();
    }

    beginTransaction(name) {
        if(this._isDoingUndoRedo) {
            console.error('undo/redo triggers an unexpected transaction');
            return;
        }

        if(this._currentTransaction.isStarted() && this._currentTransaction.name == name){
            return;
        }

        if(this._currentTransaction.isStarted() && !this._currentTransaction.isCommitted()) {
            console.error('Please commit or abort the previous transaction first: ' + this._currentTransaction.name);
            return;
        }
        this._currentTransaction.name = name;
        this._currentTransaction.start();
        console.log('The transaction begins: ' + name);
    }

    addPromise(promise){
        this._promiseManager.addPromise(promise);
    }

    lastUndoTransaction(){
        return this._undoList[this._undoList.length - 1];
    }

    _commitTransaction() {
        if(this._currentTransaction.isValid() == false) {
            console.log('The transaction is aborted since nothing is changed: ' + this._currentTransaction.name);
            this._currentTransaction.abort();
        } else {
            console.log('The transaction ends: ' + this._currentTransaction.name);
            this._currentTransaction.commit();
            this._undoList.push(this._currentTransaction);
            if(this._undoList.length > maximumUndoSteps) {
                this._undoList = this._undoList.slice(this._undoList.length - maximumUndoSteps);
            }
            this._redoList = [];
            this._currentTransaction = new Transaction(this._modelview, this._entityMemento, this._currentTransaction.endSnapshot);
        }
    }

    endTransaction() {
        if(this._isDoingUndoRedo) {
            console.error('undo/redo triggers an unexpected transaction');
            return;
        }
        if(this._currentTransaction.isStarted() == false) {
            console.error('The transaction is not started yet; please call beginTransaction() first');
            return;
        }

        EventsManager.instance().dispatch(Events.designUpdating, this._promiseManager);
        this._promiseManager.done().then(() => {
            this._commitTransaction();
            EventsManager.instance().dispatch(Events.designChanged, this);
        }).catch(err => {
            console.log('The transaction is aborted: ' + this._currentTransaction.name);
            this._isDoingUndoRedo = true;
            this._currentTransaction.abort();
            this._isDoingUndoRedo = false;
            EventsManager.instance().dispatch(Events.designChanged, this);
        });
    }

    abortTransaction() {
        if(this._isDoingUndoRedo) {
            console.error('undo/redo triggers an unexpected transaction');
            return;
        }
        
        if(this._currentTransaction.isStarted() == false) {
            return;
        }
        console.log('The transaction is aborted: ' + this._currentTransaction.name);
        ComputeEngine.instance().abort();

        EventsManager.instance().dispatch(Events.designUpdating, this._promiseManager);
        this._promiseManager.done().then(() => {
            this._isDoingUndoRedo = true;
            this._currentTransaction.abort();
            this._isDoingUndoRedo = false;
            EventsManager.instance().dispatch(Events.designChanged, this);
        }).catch(err => {
            this._isDoingUndoRedo = true;
            this._currentTransaction.abort();
            this._isDoingUndoRedo = false;
            EventsManager.instance().dispatch(Events.designChanged, this);
        });
    }

    undo() {
        if(this._undoList.length <= 0) {
            return;
        }
        this._isDoingUndoRedo = true;
        this._currentTransaction.abort();
        const transaction = this._undoList.pop();
        transaction.undo();
        this._redoList.push(transaction);
        this._currentTransaction.beginSnapshot = transaction.beginSnapshot;
        this._isDoingUndoRedo = false;
        EventsManager.instance().dispatch(Events.designChanged, this);
    }

    redo() {
        if(this._redoList.length <= 0) {
            return;
        }
        this._isDoingUndoRedo = true;
        this._currentTransaction.abort();
        const transaction = this._redoList.pop();
        transaction.redo();
        this._undoList.push(transaction);
        this._currentTransaction.beginSnapshot = transaction.endSnapshot;
        this._isDoingUndoRedo = false;
        EventsManager.instance().dispatch(Events.designChanged, this);
    }

    entityChanged(entity) {
        if(this._isDoingUndoRedo) {
            return;
        }
        this._currentTransaction.registerEntityChange(entity);
    }

    registerChange(change) {
        if(this._isDoingUndoRedo) {
            return;
        }
        this._currentTransaction.registerChange(change);
    }
}

export default TransactionSession;