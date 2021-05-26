import * as THREE from 'three'
import { AxisGroup } from './axisgroup';
import Entity from 'three-engine/core/model/entity';
import { entityTypes } from 'three-engine/core/model/entitytypes';
import { EventsManager } from 'three-engine/core/events/manager';
import { Events } from 'three-engine/core/events/events';

class AxisGridCustomized extends Entity {
    constructor() {
        super(entityTypes.AxisGridCustomized);
        this._X = null;
        this._Y = null;
        this._sumX = 0;
        this._sumY = 0;
        this._instance = null;
    }

    movable() {
        return true;
    }

    getAxisLines() {
        let arr = [];
        let v = [];
        for (let p = this._X; p; p = p.next) {
            v.push(p);
        }
        for (let p = this._Y; p; p = p.next) {
            v.push(p);
        }
        v.forEach(itr=> {
            arr.push(...itr.entities);
        });
        return arr;
    }

    destroy() {
        for (let p = this._X; p; p = p.next) {
            p.clearTransient();
        }
        for (let p = this._Y; p; p = p.next) {
            p.clearTransient();
        }
        this.notifyRemoved();
    }

    fromJson(js) {
        this._sumX = js.sumX;
        this._sumY = js.sumY;
        let xRef = null;
        let yRef = null;
        js.arrX.forEach(itr => {
            let gx = new AxisGroup();
            gx.fromJson(itr);
            if (xRef) {
                xRef.next = gx;
            }
            gx.prev = xRef;
            gx.next = null;
            xRef = gx;
            if (!this._X) {
                this._X = xRef;
            }
        });

        js.arrY.forEach(itr => {
            let gy = new AxisGroup();
            gy.fromJson(itr);
            if (yRef) {
                yRef.next = gy;
            }
            gy.prev = yRef;
            gy.next = null;
            yRef = gy;
            if (!this._Y) {
                this._Y = yRef;
            }
        });
        EventsManager.instance().dispatch(Events.fitView);
    }

    toJson() {
        let obj = super.toJson();
        let arrX = [];
        let arrY = [];
        for (let p = this._X; p; p = p.next) {
            let json = p.toJson();
            arrX.push(json);
        }
        for (let p = this._Y; p; p = p.next) {
            let json = p.toJson();
            arrY.push(json);
        }
        return Object.assign(obj, {
            sumX: this._sumX,
            sumY: this._sumY,
            arrX: arrX,
            arrY: arrY
        });
    }

    _buildDefault() {
        if (!this._X) {
            this.add(0, 1, null, true, true);
        }
        if (!this._Y) {
            this.add(0, 1, null, true, false);
        }
        this.notifyAdded();
    }

    add(dist, num, ref, after, isX) {
        let p = new AxisGroup();
        p.dist = dist;
        p.num = num;
        if (!ref) {
            p.prev = null;
            p.next = null;
            this._updateHead(isX, p);
            this._update(isX);
            return;
        }
        if (after) {
            p.next = ref.next;
            p.prev = ref;
            let next = ref.next;
            if (next) {
                next.prev = p;
            }
            ref.next = p;
        } else {
            p.next = ref;
            p.prev = ref.prev;
            let prev = ref.prev;
            if (prev) {
                prev.next = p;
            }
            ref.prev = p;
            if (!p.prev) {
                this._updateHead(isX, p);
            }
        }
        this._update(isX);
        return p;
    }

    del(p, isX) {
        if (!p) {
            return;
        }
        
        let prev = p.prev;
        let next = p.next;
        p.clearTransient();
        if (!prev && !next) {
            this._updateHead(isX, null);
            this._update(isX);
            return;
        }
        if (prev) {
            prev.next = next;
            if (!prev.prev) {
                this._updateHead(isX, prev);
            }
        }
        if (next) {
            next.prev = prev;
            if (!next.prev) {
                this._updateHead(isX, next);
            }
        }
        this._update(isX);
    }

    modify(p, dist, num) {
        if (!p) {
            return;
        }
        p.dist = dist;
        p.num = num;
        this._update();
    }

    _update() {
        this._sumX = 0;
        this._sumY = 0;
        this._calcSum(true);
        this._calcSum(false);
        this._regen(true);
        this._regen(false);
        EventsManager.instance().dispatch(Events.fitView);
    }

    _regen(isX) {
        let head = isX ? this._X : this._Y;
        if (!head) {
            return;
        }
        let level = 0;
        let index = 0;
        for (let p = head; p; index += p.num, p = p.next) {
            if (index === 0) {
                level -= p.dist;
            }
            p.len = isX ? this._sumY : this._sumX;
            level = p.generateCurves(level, index, isX);
        }
    }

    _calcSum(isX) {
        let head = isX ? this._X : this._Y;
        if (!head) {
            return;
        }
        let level = 0;
        let index = 0;
        for (let p = head; p; index++, p = p.next) {
            if (index === 0) {
                level -= p.dist;
            }
            level += p.sum;
        }
        isX ? this._sumX = level : this._sumY = level;
    }

    _updateHead(isX, p) {
        isX ? this._X = p : this._Y = p;
    }

    static load() {
        if (this._instance) {
            this._instance.destroy();
        }
        this._instance = new AxisGridCustomized();
        this._instance._buildDefault();
    }

    static instance() {
        return this._instance
    }
}

export { AxisGridCustomized }