import actionStatus from '../actions/actionstatus';
import _ from 'lodash';

class ActionManager {
    constructor() {
        this.currentAction = undefined;
        this.actions = [];

        this.currentView = undefined;
        this.eventMap = new Map();
        this._currentCommand = null;
        this._defaultPickFilter = null;
        this._isDesignUpdating = false;
        this._pendingTerminate = false;
    }


    get isDesignUpdating() {
        return this._isDesignUpdating;
    }

    set pendingTerminate(p) {
        this._pendingTerminate = p;
    }

    notifyDesignUpdateStarted() {
        this._isDesignUpdating = true;
    }

    notifyDesignUpdateFinished() {
        this._isDesignUpdating = false;
        if (this._pendingTerminate) {
            this.terminateCurrentCommand();
            this._pendingTerminate = false;
        }
    }

    reset() {
        if (this._currentCommand) {
            this._currentCommand.onEnd();
            this._currentCommand = null;
        }

        if (this.currentAction) {
            this.currentAction.markFinished();
            this.currentAction = undefined;
        }
        this.actions = [];
    }

    finishCurrentAction() {
        if (this.currentAction) {
            this.currentAction.markFinished();
            this.currentAction = undefined;
        }
    }

    blockingEvents(e) {
        if (this.isRunningDefault()) {
            return false;
        }

        if (this.currentAction) {
            let blocking = this.currentAction.blockingEvents(e);
            if (blocking != undefined) {
                return blocking;
            }
        }

        return this._currentCommand.blocking;
    }

    isRunningDefault() {
        return (!this._currentCommand || !this.currentView || (this._currentCommand == this.currentView.defaultCommand));
    }

    get currentCommand() {
        return this._currentCommand;
    }

    get defaultPickFilter() {
        return this._defaultPickFilter;
    }

    set defaultPickFilter(value) {
        this._defaultPickFilter = value;
    }

    get pickFilter() {
        if (this.currentAction) {
            return this.currentAction.pickFilter;
        }

        return this.defaultPickFilter;
    }

    processCommand(cmd) {
        if (cmd) {
            this.reset();
            cmd.onStart();
            const action = cmd.execute();
            if (action) {
                action.command = cmd;
                this.startAction(action);
            }
            this._currentCommand = cmd;
        }
    }

    startAction(action) {
        this.actions.push(action);
        this.currentAction = action;
        action.init();
    }

    customizeManipulator(args) {
        if (this.currentAction) {
            this.currentAction.customizeManipulator(args);
        }
    }

    previewEvent() {
        if (this.actions.length === 0) {
            // Process default command
            this.processCommand(this.currentView.defaultCommand);
        } else if (this.currentAction && this.currentAction.status !== actionStatus.Unfinished) {
            this.actions.pop();
            if (this.actions.length === 0) {
                // Process default command
                this.processCommand(this.currentView.defaultCommand);
            } else {
                this.currentAction = _.last(this.actions);
                this.currentAction.childActionStatusChanged();
            }
        }
    }

    showContextMenu(e) {
        if (this.currentAction) {
            return this.currentAction.showContextMenu(e);
        }

        return true;
    }

    terminateCurrentCommand() {
        this.reset();
    }

    cancelAndResumeCurrentCommand() {
        let cmd = this.currentCommand;
        this.reset();
        this.processCommand(cmd);
    }

    onViewerChanged(data) {
        if (this.currentCommand) {
            this.currentCommand.onViewerChanged(data);
        }
    }

    onMouseDown(event) {
        this.previewEvent();

        if (this.currentAction) {
            if (event.button === 0) {
                this.currentAction.lMouseDown(this.currentView, event);
            } else if (event.button === 2) {
                this.currentAction.rMouseDown(this.currentView, event);
            }
        }
    }

    onMouseUp(event) {
        this.previewEvent();

        if (this.currentAction) {
            if (event.button === 0) {
                this.currentAction.lMouseUp(this.currentView, event);
            } else if (event.button === 2) {
                this.currentAction.rMouseUp(this.currentView, event);
            }
        }
    }

    onMouseOut(event) {
        this.previewEvent();

        if (this.currentAction) {
            this.currentAction.mouseOut(this.currentView, event);
        }
    }

    onClick(event) {
        this.previewEvent();
        if (this.currentAction) {
            this.currentAction.click(this.currentView, event);
        }
    }

    onMouseMove(event) {
        this.previewEvent();

        if (this.currentAction) {
            this.currentAction.mouseMove(this.currentView, event);
        }
    }

    onKeyDown(event) {
        this.previewEvent();

        if (this.currentAction) {
            this.currentAction.keyDown(this.currentView, event);
        }
    }

    onKeyUp(event) {
        this.previewEvent();

        if (this.currentAction) {
            this.currentAction.keyUp(this.currentView, event);
        }
    }

    onDragOver(event) {
        this.previewEvent();

        event.preventDefault();
        if (this.currentAction) {
            this.currentAction.dragOver(this.currentView, event);
        }
    }

    onDrop(event) {
        this.previewEvent();

        event.preventDefault();
        if (this.currentAction) {
            this.currentAction.drop(this.currentView, event);
        }
    }
}

const actionManager = new ActionManager();

export default actionManager;