import Curve from './curve';
import curveTypes from './curvetypes';

class Arc extends Curve {
    constructor() {
        super(curveTypes.Arc);
    }
}

export default Arc;