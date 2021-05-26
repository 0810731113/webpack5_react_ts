import actionStatus from './actionstatus';
import actionManager from './actionmanager';

class Action {
    constructor() {
        this.status = actionStatus.Unfinished;
        this.command = undefined;
        this._pickFilter = null;
        this._mouseTracker = {};
        this._commandResumeable = false;
    }

    init() {

    }

    get pickFilter() {
        return this._pickFilter;
    }

    set pickFilter(value) {
        this._pickFilter = value;
    }

    markFinished() {
        this.status = actionStatus.Finished;
    }

    markCancelled() {
        this.status = actionStatus.Cancelled;
    }

    startChildAction(action) {
        action.command = this.command;
        actionManager.startAction(action);
    }

    childActionStatusChanged() {

    }

    customizeManipulator(args) {

    }

    click(viewer, mouse) {
    }

    lMouseDown(/*viewer, mouse*/) {

    }

    lMouseUp(/*viewer, mouse*/) {

    }

    rMouseDown(/*viewer, mouse*/) {
        this._mouseTracker.rDown = true;
        this._mouseTracker.rMove = false;
        this._mouseTracker.rUp = false;
    }

    rMouseUp(/*viewer, mouse*/) {
        this._mouseTracker.rUp = true;
        this._mouseTracker.rDown = false;
        if (this._commandResumeable && this._mouseTracker.rUp && !this._mouseTracker.rMove) {
            actionManager.cancelAndResumeCurrentCommand();
        }
    }

    mouseMove(/*viewer, mouse*/) {
        if (this._mouseTracker.rDown) {
            this._mouseTracker.rMove = true;
        }
    }

    mouseOut(/*viewer, mouse*/) {

    }

    keyDown(viewer, event) {

    }
    // 全装的esc keydown 无法触发，只能用keyup，希望大神指导
    keyUp(viewer, event) {
        if (viewer && event.key === 'Escape') {
            if (!actionManager.isDesignUpdating) {
                this.markCancelled();
            } else {
                actionManager.pendingTerminate = true;
            }
        }
    }

    dragOver(/*viewer, event*/) {

    }

    drop(/*viewer, event*/) {

    }

    blockingEvents(e) {
        return undefined;
    }

    showContextMenu(e) {
        return true;
    }
}

export default Action;