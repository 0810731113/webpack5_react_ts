import { EventsManager } from '../events/manager';
import { Events } from '../events/events';
import selectorMode from './selectormode';

class Selector {
    constructor() {
        this._ssEnts = new Map();
        this._ssMode = selectorMode.Single;
    }

    do(entity, param) {
        if(this._ssMode === selectorMode.Single) {
            this.ssClear();
            this.select(entity, param);
        }else if(this._ssMode === selectorMode.Multiple){
            if(this.selected(entity)){
                this.deselect(entity);
            }else{
                this.select(entity,param);
            }
        }else if(this._ssMode === selectorMode.None){
            return;
        }
    }

    set ssMode(ssmode){
        this._ssMode = ssmode;
    }

    select(entity, param, disableEvents = false) {
        if (!entity) {
            return;
        }

        let changed = false;
        let ents = Array.isArray(entity) ? entity : [entity];
        ents.forEach(itr => {
            if (this._handleSelect(itr, param)) {
                changed = true;
            }
        });

        if (changed && !disableEvents) {
            let args = {};
            args.selected = true;
            args.old = [];
            args.new = ents;
            args.param = param;
            EventsManager.instance().dispatch(Events.ssChanged, args);
        }
    }

    deselect(entity) {
        if (!entity) {
            return;
        }
        let changed = false;
        let ents = Array.isArray(entity) ? entity : [entity];
        ents.forEach(itr => {
            if (this._handleDeselect(itr)) {
                changed = true;
            }
        });

        if (changed) {
            let args = {};
            args.selected = false;
            args.old = [];
            args.new = ents;
            EventsManager.instance().dispatch(Events.ssChanged, args);
        }
    }

    ssClear() {
        this._ssEnts.forEach(itr => {
            this.deselect(itr.ent);
        });
    }

    selected(entity) {
        return entity ? this._ssEnts.get(entity.id) : false;
    }

    ss() {
        let ents = [];
        this._ssEnts.forEach(itr => {
            ents.push(itr.ent);
        });
        return ents;
    }

    get ssEnts() {
        return this._ssEnts;
    }

    _handleSelect(entity, param) {
        if (!entity) {
            return false;
        }
        this._cameraEnablePan(false);
        let bOK = !this.selected(entity);
        let viewable = param.viewable;
        viewable.drawOutline(param.meshId);
        this._ssEnts.set(entity.id, { ent: entity, param: param });
        let c = viewable.controller;
        if (c) {
            c.onselected(param);
        }
        return bOK;
    }

    _cameraEnablePan(enabled){
        let args = {};
        args.enabled = enabled;
        EventsManager.instance().dispatch(Events.cameraEnablePan, args);
    }

    _handleDeselect(entity) {
        if (!this.selected(entity)) {
            return false;
        }
        this._cameraEnablePan(true);
        let id = entity.id;
        let v = this._ssEnts.get(id);
        let viewable = v.param.viewable;
        viewable.hideOutline();
        this._ssEnts.delete(id);
        let c = viewable.controller;
        if (c) {
            c.ondeselected(v.param);
        }
        return true;
    }
}

export { Selector }