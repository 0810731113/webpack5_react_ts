import Action from './action';
import * as THREE from 'three'
import { Application } from '../application';
import auxiliaryLineDimUtils from '../../utils/auxliarylinedimutils';
import TransactionManager from '../transactions/transactionmanager';
import appStore from '../../app/ui/data/store/configureStore';
import { setArrayBar } from '../../app/ui/data/actions/winEvents';
class ArrayAction extends Action {
    constructor() {
        super();
        this._started = false;

        this._direction = 0;//default horizontal
        this._dirVal = 1;// 1:right or up ; -1:left or down
        this._qty = 4;
        this._distVal = 2000;

        this._copiedEnts = [];
    }

    get dirVal() {
        return this._dirVal;
    }

    set dirVal(dirVal) {
        this._dirVal = dirVal;
    }

    get qty() {
        return this._qty;
    }

    set qty(qty) {
        this._qty = qty; 
    }

    get distVal() {
        return this._distVal;
    }

    set distVal(distVal) {
        this._distVal = distVal;
    }

    update() {
        this.clearDims();
        this.delete();
        this.create();
    }

    create() {
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
        const direction = ent.direction;
        if (direction.y == 1) {
            this._direction = 1;//set vertical
        }

        const originalViewable = viewer.lookupViewable(ent);
        if (!originalViewable || !originalViewable.canCopy) {
            return null;
        }
        const ent1s = [];
        ent1s.push(ent);
        for (let i=0; i<this._qty; i++) {
            const copiedEnt = ent.copy();
            let vector = copiedEnt.getPosition();
            if (this._direction == 0) {//horizontal
                vector.y = vector.y + this._dirVal * this._distVal * (i+1);
            }
            if (this._direction == 1) {//vertical
                vector.x = vector.x - this._dirVal * this._distVal * (i+1);
            }
            copiedEnt.setPosition(vector);
            ent1s.push(copiedEnt);
            this._copiedEnts.push(copiedEnt);
            auxiliaryLineDimUtils.showAuxiliaryLineDims(copiedEnt, ent1s.slice(i, i+1), copiedEnt.getPosition());
        }
    }

    delete() {
        const viewer = Application.instance().getActiveView();
        if (!viewer) {
            return null;
        }
        
        const ents = viewer.selector.ss();
        if (ents.length === 0) {
            return null;
        }

        const ent = ents[0];
        const auxiliaryLineSet = ent._parent;
        this._copiedEnts.forEach(e => {
            auxiliaryLineSet.del(e);
        })

    }

    clearView() {
        this.markFinished();
    }

    clearDims() {
        this._copiedEnts.forEach(ent => {
            auxiliaryLineDimUtils.clearDims(ent);
        })
    }

    // 重写keyup方法
    keyUp(viewer, event) {
        if (viewer && event.key === 'Escape') {
            console.log('The transaction aborts: esc keyup pressed');
            this.clearView();
            this.clearDims();
            appStore.dispatch(setArrayBar(false));
            TransactionManager.abortTransaction();
        }
    }

}

export { ArrayAction }