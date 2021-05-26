class DummySession {
    constructor(modelview) {
        
    }

    isTransactionStarted() {
        return false;
    }

    beginTransaction(name) {
        
    }

    endTransaction() {
        
    }

    addPromise(promise){

    }

    abortTransaction() {
        
    }

    undo() {
        
    }

    redo() {
        
    }

    lastUndoTransaction(){
        
    }

    entityChanged(entity) {
        entity.revise();
    }

    registerChange(change) {
        
    }
}

export default DummySession;