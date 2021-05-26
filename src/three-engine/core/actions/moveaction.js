import Action from './action';

class MoveAction extends Action {
    constructor() {
        super();
    }

    lMouseUp(viewer, e) {
        this.markFinished();
    }

    rMouseUp(viewer, e) {
        this.markFinished();
    }
}

export { MoveAction }