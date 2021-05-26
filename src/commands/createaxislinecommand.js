import Command from 'three-engine/core/commands/command';
import { Application } from 'three-engine/core/application';
import { CreateAxisLineAction } from './createaxislineaction';
import actionManager from 'three-engine/core/actions/actionmanager';
import { PreviewTypes } from 'three-engine/core/model/previewtypes';
import { AxisLineSnapManager } from 'three-engine/bim/snap/axisline/manager';
import { CanvasUtil, CursorTypes } from './canvasUtil';


class CreateAxisLineCommand extends Command {
    constructor(cb) {
        super();
        this._viewer = Application.instance().getActiveView();
        this._preview = null;
        this._snapMgr = null;
        this._cb = cb;
    }

    execute() {
        super.execute();
        return new CreateAxisLineAction(this._preview, this._viewer, this._snapMgr);
    }

    onStart() {
        this._viewer.selector.ssClear();
        this._snapMgr = new AxisLineSnapManager();
        this._snapMgr.setup(this._viewer);
        this._preview = this._viewer.createPreview(PreviewTypes.AxisLine);
        CanvasUtil.applyCursor(CursorTypes.CrossHair);
    }

    onEnd() {
        if (this._preview) {
            this._viewer.delViewable(this._preview);
        }
        this._snapMgr = null;
        this._cb()
        CanvasUtil.unapplyCursor();
    }

    onViewerChanged(data) {
        actionManager.terminateCurrentCommand();
    }
}

export { CreateAxisLineCommand }