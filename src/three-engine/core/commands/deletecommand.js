import { DeleteAction } from '../actions/deleteaction';
import { Application } from '../application';
import Command from './command';

class DeleteCommand extends Command {
    constructor() {
        super();
        this._name = 'DeleteCommand';
    }

    get name() {
        return this._name;
    }

    execute() {
        super.execute();
        const viewer = Application.instance().getActiveView();
        const action = this.createAction(viewer);
        if (action.interactive) {
            return action;
        } else {
            action.delEntity(viewer);
        }
    }

    createAction(viewer) {
        let factory = Application.instance().deleteActionFactory;
        return factory ? factory.create(viewer) : new DeleteAction();
    }
}

export { DeleteCommand };
