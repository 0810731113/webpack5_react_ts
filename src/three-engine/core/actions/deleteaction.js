import { Application } from '../application';
import { EntitySet } from '../model/entityset';
import Action from './action';

class DeleteAction extends Action {
    constructor() {
        super();
        this._interactive = false;
    }

    get interactive() {
        return this._interactive;
    }

    delEntity(viewer) {
        let ss = viewer.selector;
        let ents = viewer.selector.ss();
        if (!this._deletable(ents)) {
            return;
        }
        ss.ssClear();
        if (ents.length > 0) {
            if (ents.forEach(itr => {
                this._onDelete(itr);
            }));
        }
        else {
            console.log('DeleteAction.delEntity(viewer): No entity is selected, will delete nothing');
        }
    }

    _deletable(ents) {
        let bOK = false;
        ents.forEach(itr => {
            if (itr.canDel) {
                bOK = true;
            }
        });
        return bOK;
    }

    _onDelete(entity) {
        if (entity.parent && entity.parent instanceof EntitySet) {
            let bOK = false;
            let viewer = Application.instance().getActiveView();
            if (viewer) {
                let viewable = viewer.lookupViewable(entity);
                if (viewable) {
                    let controller = viewable.controller;
                    controller.del();
                    bOK = true;
                }
            }
            if (!bOK) {
                entity.parent.del(entity);
            }
        }
    }

    /**
     * 判断ents中的元素是否已经处于deleting状态
     *
     * @param {*} ents
     * @returns true：已经处于deleting状态，false：不处于deleting状态
     * @memberof DeleteAction
     */
    isRepeatCall(ents) {
        if (ents && ents instanceof Array && ents.filter(e => e.userData && e.userData.deleting).length > 0) {
            return true;
        }
        return false;
    }

    /**
     * 将ents的状态设为deleting
     *
     * @param {*} ents
     * @memberof DeleteAction
     */
    setRepeatState(ents) {
        if (ents && ents instanceof Array) {
            ents.forEach(ent => {
                ent.userData.deleting = true;
            });
        }
    }

    /**
     * 删除ents上的deleting状态
     *
     * @param {*} ents
     * @memberof DeleteAction
     */
    restRepeatState(ents) {
        if (ents && ents instanceof Array) {
            ents.forEach(ent => {
                delete ent.userData.deleting;
            });
        }
    }
}

export { DeleteAction }