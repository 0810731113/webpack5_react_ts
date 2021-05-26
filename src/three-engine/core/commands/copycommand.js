import { Application } from '../application';
import Command from './command';
import { CopyAction } from '../actions/copyaction';
import TransactionManager from '../transactions/transactionmanager';

class CopyCommand extends Command {
    constructor() {
        super();
        this._name = 'CopyCommand';
    }

    get name() {
        return this._name;
    }

    execute() {
        super.execute();

        const viewer = Application.instance().getActiveView();
        if (!viewer) {
            return null;
        }

        const ents = viewer.selector.ss();
        if (ents.length === 0) {
            return null;
        }

        const ent = ents[0];
        if (!ent.canCopy) {
            return null;
        }

        viewer.selector.ssClear();

        const originalViewable = viewer.lookupViewable(ent);
        if (!originalViewable || !originalViewable.canCopy) {
            return null;
        }

        TransactionManager.beginTransaction('copy');

        const copiedEnt = ent.copy();
        if (!copiedEnt) {
            return null;
        }

        const viewable = viewer.lookupViewable(copiedEnt);
        if (!viewable) {
            return null;
        }

        const controller = viewable.controller;
        controller.mode = 'create'; // for openings
        return new CopyAction(controller);
    }
}

export { CopyCommand };
