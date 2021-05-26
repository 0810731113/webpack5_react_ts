import { AxisLineGizmo2d } from './gizmo';

class AxisLineGizmoCreator {
    constructor() {
    }

    static make(viewer, drawTool, dim, snaps, thickness) {
        return new AxisLineGizmo2d(viewer, drawTool, dim, snaps, thickness);
    }
}

export { AxisLineGizmoCreator }