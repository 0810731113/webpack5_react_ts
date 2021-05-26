import Command from './command';
import { ArrayAction } from '../actions/arrayaction';
import TransactionManager from '../transactions/transactionmanager';
import appStore from '../../app/ui/data/store/configureStore';
import { setArrayBar } from '../../app/ui/data/actions/winEvents';

class ArrayCommand extends Command {
    constructor() {
        super();
        this._name = 'ArrayCommand';
    }

    get name() {
        return this._name;
    }

    execute() {
        super.execute();
        TransactionManager.beginTransaction('array');
        const action = new ArrayAction();
        action.create();
        return action;
    }

    onEnd() {
        appStore.dispatch(setArrayBar(false));
    }
}

export { ArrayCommand };
