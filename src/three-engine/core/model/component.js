import Entity from './entity';
import { entityTypes } from './entitytypes';

class Component extends Entity {
    constructor() {
        super(entityTypes.Comp);
        this._body = null;
        this._refKey = null;
        this._cis = [];
    }

    set design(p) {
        this._design = p;
        if (this._body) {
            this._body.design = p;
        }
    }

    get design() {
        return this._design;
    }

    get body() {
        return this._body;
    }

    set body(p) {
        this._body = p;
    }

    get cis() {
        return this._cis;
    }

    get refKey() {
        return this._refKey;
    }

    set refKey(k) {
        this._refKey = k;
    }

    dispose() {
    }
    
    deserialize(data, metaData) {
        super.deserialize(data, metaData);
        this._body = data.body;
        this._cis = data.cis;
        this._refKey = data.refKey;
    }

    serializedData() {
        let obj = super.serializedData();
        return Object.assign(obj, {
            body: this._body,
            cis: this._cis,
            refKey: this._refKey
        });
    }

    onLinkedEntities() {
        let arr = super.onLinkedEntities();
        arr.push(this._body);
        arr.push(...this.cis);
        return arr;
    }

    stageChange() {
        if (this._body) {
            this._body.stageChange();
        }
        super.stageChange();
    }

    onFixLink(entityMap) {
        super.onFixLink(entityMap);
        if (this._body) {
            this._body = entityMap.get(this._body);
        }

        let cis = this._cis;
        this._cis = [];
        if (cis) {
            cis.forEach(itr => {
                let ci = entityMap.get(itr);
                if (ci) {
                    this._cis.push(ci);
                }
            });
        }
    }

    serializedMetaData() {
        return {
            className: 'Component',
            schemaVersion: 0
        };
    }

    addInst(ci) {
        let idx = this._cis.indexOf(ci);
        if (idx < 0) {
            this._cis.push(ci);
            this.stageChange();
        }
    }

    delInst(ci) {
        let idx = this._cis.indexOf(ci);
        if (idx >= 0) {
            this._cis.splice(idx, 1);
            this.stageChange();
        }
    }
}

export { Component }