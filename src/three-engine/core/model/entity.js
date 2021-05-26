import * as THREE from 'three'
import { DirtyType } from '../display/dirtytype';
import { EventsManager } from '../events/manager';
import { Events } from '../events/events';
import nodeuuid from 'node-uuid';

const identity = new THREE.Matrix4();

class Entity {
    constructor(type) {
        this._type = type;
        this._dirty = DirtyType.All;
        this._mtxLocal = new THREE.Matrix4();
        this._design = null;
        this._vis = true;
        this._shownAsBackground = false;
        this._material = null;
        this._parent = null;
        this._pendingToDraw = false;
        this._userData = {};
        this._subscribers = [];
        this._entityId = nodeuuid.v4();
    }

    get subscribers(){
        return this._subscribers;
    }

    get parent() {
        return this._parent;
    }

    set parent(p) {
        this._parent = p;
    }

    get material() {
        return this._material;
    }

    set material(p) {
        this._material = p;
    }

    get design() {
        return this._design;
    }

    set design(p) {
        this._design = p;
    }

    get vis() {
        return this._vis;
    }

    set vis(v) {
        this._vis = v;
    }

    get id() {
        return this._entityId;
    }

    set id(p) {
        this._entityId = p;
    }

    get type() {
        return this._type;
    }

    set type(f) {
        this._type = f;
    }

    get dirty() {
        if(this.body){
            this._dirty = this.body.dirty;
        }
        return this._dirty;
    }

    set dirty(f) {
        if(this.body){
            this.body.dirty = f;
        }
        this._dirty = f;
    }

    set mtxLocal(local) {
        this._mtxLocal = local;
        this.stageChange();
    }

    get mtxLocal() {
        return this._mtxLocal;
    }

    get localToWorldMatrix() {
        return this.mtxLocal;
    }

    get mtxModel() {
        return new THREE.Matrix4();
    }

    get canDel() {
        return true;
    }

    get shownAsBackground() {
        return this._shownAsBackground;
    }

    get pendingToDraw() {
        return this._pendingToDraw;
    }

    set pendingToDraw(p) {
        if (p) {
            this.dirty = DirtyType.All;
            EventsManager.instance().dispatch(Events.entityPendingToDraw, this);
        }
        this._pendingToDraw = p;
    }

    get userData() {
        return this._userData;
    }

    set userData(d) {
        this._userData = d;
    }

    set shownAsBackground(p) {
        this._shownAsBackground = p;
    }

    get adsorbTypes() {
        return [];
    }

    onRemoved() {
    }

    movable() {
        return false;
    }

    setPosition(pos) {
        this._mtxLocal.setPosition(new THREE.Vector3(pos.x, pos.y, pos.z));
        this.dirty = DirtyType.Transform;
        this.stageChange();
    }

    getPosition() {
        return new THREE.Vector3().setFromMatrixPosition(this._mtxLocal);
    }

    assign(source) {
        super.assign(source);
        
        this._mtxLocal = source._mtxLocal.clone();
        this._design = source._design;
        this._vis = source._vis;
        this._shownAsBackground = source._shownAsBackground;
        this._material = source._material;
        this._parent = source._parent;
        this._userData = JSON.parse(JSON.stringify(source._userData));
    }

    copy() {
        return null;
    }

    fromJson(js) {
        this.id = js.id;
    }

    toJson() {
        let data = {};
        data.id = this.id;
        data.curveType = Symbol.keyFor(this.type);
        return data;
    }

    serializedData() {
        //Only serialize those members whose values are not default ones
        let obj = super.serializedData();
        let data = {};
        if(!this._mtxLocal.equals(identity)) {
            data.mtxlocal = this._mtxLocal.toArray();
        }
        if(!this._vis) {
            data.vis = this._vis;
        }
        if(this._material) {
            data.material = this._material;
        }
        if(this._parent) {
            data.parent = this._parent;
        }
        if(this._subscribers.length > 0) {
            data.subscribers = this._subscribers;
        }
        return Object.assign(obj, data);
    }

    deserialize(data, metaData) {
        super.deserialize(data, metaData);
        //Important!!! ----- Make sure to reset the member value to the default ones if there is no corresponding field in the JSON data
        //otherwise it could break the undo/redo behavior since undo/redo relies on the "serialize/deserialize" to save/restore the changed object states
        if (data.mtxlocal != undefined) {
            this._mtxLocal.fromArray(data.mtxlocal);
        } else {
            this._mtxLocal = new THREE.Matrix4(); 
        }
        if (data.vis != undefined) {
            this._vis = data.vis;
        } else {
            this._vis = true;
        }
        if (data.parent != undefined) {
            this._parent = data.parent;
        } else {
            this._parent = null;
        }
        if (data.material != undefined) {
            this._material = data.material;
        } else {
            this._material = null;
        }
        if(data.subscribers != this.undefined) {
            this._subscribers = data.subscribers;
        } else {
            this._subscribers = [];
        }
    }

    onLinkedEntities() {
        let arr = super.onLinkedEntities();
        if(this._material) {
            arr.push(this._material);
        }
        if(this._parent) {
            arr.push(this._parent);
        }
        if(this._subscribers.length > 0) {
            arr.push(...this._subscribers);
        }
        return arr;
    }

    onFixLink(entityMap) {
        super.onFixLink(entityMap);
        if (this._parent) {
            this._parent = entityMap.get(this._parent);
        }

        if (this._material) {
            this._material = entityMap.get(this._material);
        }

        if(this._subscribers.length > 0) {
            this._subscribers = this._subscribers.map( entityId => entityMap.get(entityId));
            this._subscribers = this._subscribers.filter((item) => {
                return (item != null) && (item != undefined);
            })
        }
    }

    onPostLoad() {
        super.onPostLoad();
        this.dirty = DirtyType.All;
    }

    onDelete(doc) {
        
    }

    onLoaded() {
    }

    getViewableEntities() {
        return [this];
    }

    notifyAdded() {
        EventsManager.instance().dispatch(Events.entityAdded, this);
    }

    notifyRemoved() {
        EventsManager.instance().dispatch(Events.entityRemoved, this);
    }

    frameRendered() {
        this.dirty = DirtyType.Nothing;
    }

    del(kid) {
    }

    removeFromParent() {
        if (!this._parent) {
            return;
        }
        this._parent.del(this);
    }

    _toVector(p) {
        return new THREE.Vector3(p.x, p.y, p.z);
    }

    stageChange() {
        
    }

    subscribe(dependentEntity) {
        if(dependentEntity && this._subscribers.indexOf(dependentEntity) == -1) {
            this._subscribers.push(dependentEntity);
            this.stageChange();
        }
    }

    unsubscribe(dependentEntity) {
        const index = this._subscribers.indexOf(dependentEntity);
        if(index >= 0) {
            this._subscribers.splice(index, 1);
            this.stageChange();
        }
    }

    subscribeTo(dependencyEntity) {
        if(dependencyEntity) {
            dependencyEntity.subscribe(this);
        }
    }

    unsubscribeTo(dependencyEntity) {
        if(dependencyEntity) {
            dependencyEntity.unsubscribe(this);
        }
    }

    notifyDependencyChanged(data) {
        const source = {
            publisher: this,
            data: data
        }
        this._subscribers.forEach( subscriber => {
            if(subscriber) {
                subscriber.onNotifyDependencyChanged(source);
            }
        })
    }

    notifyDependencyDeleted(data) {
        const source = {
            publisher: this,
            data: data
        }
        this._subscribers.forEach( subscriber => {
            if(subscriber) {
                subscriber.onNotifyDependencyDeleted(source);
            }
        })
    }

    onNotifyDependencyChanged(source) {

    }

    onNotifyDependencyDeleted(source) {

    }
}

export default Entity;