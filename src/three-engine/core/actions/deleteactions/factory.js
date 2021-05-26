import { DeleteAction } from '../deleteaction';

class DeleteActionFactory {
    constructor() {
    }

    create(viewer) {
        return new DeleteAction();
    }
}

export { DeleteActionFactory }