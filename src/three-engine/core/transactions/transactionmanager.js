import TransactionSession from './transactionsession'
import DummySession from './dummysession'
import { EventsManager } from '../events/manager';
import { Events } from '../events/events';

class TransactionManager {
    constructor() {
        this._sessions = new Map();
        this._dummySession = new DummySession();
        this._activeSession = this._dummySession;
        this._suspended = false;
    }

    get hasTransaction() {
        return this._activeSession.hasTransaction;
    }

    bootstrap() {
        EventsManager.instance().listen(Events.designReady, this._onDesignReady, this);
        EventsManager.instance().listen(Events.designClosed, this._onDesignClosed, this);
    }

    suspend() {
        this._suspended = true;
    }

    resume() {
        this._suspended = false;
    }

    _onDesignReady(design) {
        this.registerSession(design);
        this.activateSession(design);
    }

    _onDesignClosed(design) {
        this.deactivateSession(design);
        this.unregisterSession(design);
    }

    activateSession(modelview) {
        if(this._sessions.has(modelview)) {
            this._activeSession = this._sessions.get(modelview);
        }
    }

    deactivateSession(modelview) {
        const session = this._sessions.get(modelview);
        if(session && session == this._activeSession) {
            this._activeSession = this._dummySession;
        }
    }

    registerSession(modelview) {
        if(this._sessions.has(modelview) == false) {
            this._sessions.set(modelview, new TransactionSession(modelview));
        }
    }

    unregisterSession(modelview) {
        if(this._sessions.has(modelview)) {
            this._sessions.delete(modelview);
        }
    }

    getActiveSession() {
        if(this._suspended) {
            return this._dummySession;
        }
        return this._activeSession;
    }

    static get() {
        if(s_theOnlyOne == null) {
            s_theOnlyOne = new TransactionManager();
        }

        return s_theOnlyOne;
    }

    isTransactionStarted() {
        return this._activeSession.isTransactionStarted();
    }

    beginTransaction(name) {
        this._activeSession.beginTransaction(name);
    }

    abortTransaction() {
        this._activeSession.abortTransaction();
    }

    endTransaction() {
        this._activeSession.endTransaction();
    }

    entityChanged(entity) {
        this._activeSession.entityChanged(entity);
    }

    registerChange(change) {
        this._activeSession.registerChange(change);
    }

    static suspend() {
        TransactionManager.get().suspend();
    }

    static resume() {
        TransactionManager.get().resume();
    }

    static isTransactionStarted() {
        return TransactionManager.get().getActiveSession().isTransactionStarted();
    }

    static beginTransaction(name) {
        TransactionManager.get().getActiveSession().beginTransaction(name);
    }

    static addPromise(promise){
        TransactionManager.get().getActiveSession().addPromise(promise);
    }

    static abortTransaction() {
        TransactionManager.get().getActiveSession().abortTransaction();
    }

    static endTransaction() {
        TransactionManager.get().getActiveSession().endTransaction();
    }

    static entityChanged(entity) {
        TransactionManager.get().getActiveSession().entityChanged(entity);
    }

    static registerChange(change) {
        TransactionManager.get().getActiveSession().registerChange(change);
    }

    static undo() {
        TransactionManager.get().getActiveSession().undo();
    }

    static redo() {
        TransactionManager.get().getActiveSession().redo();
    }
}

let s_theOnlyOne = null;

export default TransactionManager;