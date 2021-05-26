import * as THREE from 'three'
import { entityTypes } from 'three-engine/core/model/entitytypes';
import { EntitySet } from 'three-engine/core/model/entityset';
import { Application } from 'three-engine/core/application';
import { AxisGridCustomized } from './axisgridcustomized';
import { DirtyType } from 'three-engine/core/display/dirtytype';
import { AxisLine } from './axisline';

class AxisGrid extends EntitySet {
    constructor() {
        super(entityTypes.AxisGrid);
    }

    static get() {
        return Application.instance().axisGrid;
    }

    fromJson(js, schemaVersion) {
        this.clearTransient();
        if (!js) {
            return;
        }

        if (this._isV1(js))
        {
            schemaVersion = 1;
        }

        switch (schemaVersion)
        {
            case 1:{
                let p = new AxisGridCustomized();
                p.fromJson(js);
                let arr = p.getAxisLines();
                arr.forEach(itr => {
                    this.addTransient(itr);
                    itr.dirty = DirtyType.All;
                });
            }
            break;
            case 2:{
                super.fromJson(js);
                js.arr.forEach(itr => {
                    let p = new AxisLine(itr);
                    p.fromJson(itr);
                    this.addTransient(p);
                });
            }
            break;
            case 3:{
                super.fromJson(js);
                js.axis.lines.forEach(jsonLine => {
                    let axisline = new AxisLine();
                    axisline.fromJson(jsonLine);
                    this.addTransient(axisline);
                });
            }
            break;
            default:{
            }
            break;
        }
    }

    toJson() {
        let obj = super.toJson();
        let axisObj = {
            lines:[],
            arcs:[]
        };
        this.entities.forEach(entity => {
            switch (entity.type) {
                case entityTypes.AxisLine:{
                    axisObj.lines.push(entity.toJson());
                }
                break;
                case entityTypes.AxisArc:{
                    axisObj.arcs.push(entity.toJson());
                }
                break;
            }
        });
        return Object.assign(obj, {
            axis: axisObj
        });
    }

    _isV1(js) {
        return (js.arrX || js.arrY);
    }
}

export { AxisGrid }