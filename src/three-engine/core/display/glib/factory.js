import { ThreeDrawTool } from './threedrawtool';

class DrawToolFactory {
    constructor() {
    }

    static create() {
        return new ThreeDrawTool();
    }
}

export { DrawToolFactory }