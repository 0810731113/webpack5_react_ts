import * as THREE from 'three'
import { OffsetreviewData } from 'three-engine/bim/display/2d/preview/offsetpreviewdata';
import { Application } from 'three-engine/core/application';
import Command from 'three-engine/core/commands/command';
import { OffsetAxisLineAction } from './offsetaxislineaction';
import { CanvasUtil, CursorTypes } from './canvasUtil';

class OffsetAxisLineCommand extends Command {
    constructor(entity, cb) {
        super();
        this._name = 'OffsetAxisGridCommand';
        this._entity = null;
        this._source = entity;
        this._data = new OffsetreviewData();
        this._viewer = Application.instance().viewers.get('grid');
        this._timer = null;
        this._cb = cb;
        this._action = null;
    }

    get name() {
        return this._name;
    }

    execute() {
        super.execute();
        this._action = new OffsetAxisLineAction(this._viewer, this._data);
        return this._action;
    }
    
    onStart() {
    }

    onEnd() {
        let src = this._viewer.lookupViewable(this._data.src);
        if (src) {
            src.applyMaterial('normal');
            this._delaySelect();
        }
        let preview = this._action.viewable;
        if (preview) {
            this._viewer.delViewable(preview);
        }
        this._cb()
    }

    _delaySelect() {
        if (this._timer) {
            window.clearTimeout(this._timer);
            this._timer = null;
        }
        this._timer = window.setTimeout(() => {
            let ent = this._data.axisline;
            let viewable = this._viewer.lookupViewable(ent);
            if (viewable) {
                this._viewer.selector.do(ent, { viewable: viewable });
            }
        }, 100);
    }
}

export { OffsetAxisLineCommand }