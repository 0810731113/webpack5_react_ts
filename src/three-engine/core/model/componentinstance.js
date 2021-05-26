import Entity from './entity';
import { entityTypes } from './entitytypes';
import importUtils from '../../utils/importutils';
import { DirtyType } from '../display/dirtytype';
import TransactionManager from '../transactions/transactionmanager';
import * as THREE from 'three';
import { UsePropChangeController } from '../../app/ui/components/propAttrComponents/propChangeController';
import InputParameterUI from '../elements/parameters/inputparameterui';
import { Events } from '../events/events';
import { EventsManager } from '../events/manager';
import assetLibCodec from '../../libraries/prodlib/v2/assectcodec';
import { Opening } from '../../design/model/objects/opening/opening';
import { DoorFrame } from '../../design/model/objects/opening/doorframe';
import { OpeningProdUpdateTask } from '../../design/compute/tasks/openingprodtask';
import ComputeEngine from '../compute/engine';
import PointComponentTypes from '../../design/elements/gbmp/pointcomponent/pointcomponenttypes';
import { DropCeilingProdUpdateTask } from '../../design/compute/tasks/dropceilingprodtask';
import { ProdSet } from '../../design/model/objects/prod/prodset';

class ComponentInstance extends Entity {
    constructor() {
        super(entityTypes.Inst);
        this._comp = null;
        this._host = null;
        this._layout = {};
    }

    onNotifyDependencyChanged(source) {
        if (source.publisher == this._host) {
            let updateTask;
            if (this._host instanceof Opening) {
                updateTask = new OpeningProdUpdateTask(this);
            }

            if (this._host && this._host.component && this._host.component.type === PointComponentTypes.DropCeiling) {
                updateTask = new DropCeilingProdUpdateTask(this, source);
            }

            if(updateTask){
                ComputeEngine.instance().addTask(updateTask);
            }
        }
    }

    onNotifyDependencyDeleted(source) {
        if (source.publisher == this._host) {
            if (this._host instanceof Opening) {
                this.parent.del(this);
            }
        }
    }

    get layout() {
        return this._layout;
    }

    set layout(p) {
        this._layout = p;
    }

    get host() {
        return this._host;
    }

    set host(o) {
        if (o && this._host != o) {
            if (typeof (this._host) === 'object')
                this.unsubscribeTo(this._host);
            this._host = o;
            this.subscribeTo(this._host);
        }
    }

    get design() {
        return this._design;
    }

    set design(p) {
        this._design = p;
        if (this._comp) {
            this._comp.design = p;
        }
    }

    get boundingBox(){
        return this._comp.boundingBox;
    }

    get type() {
        return this._comp ? this._comp.type : this._type;
    }

    get comp() {
        return this._comp;
    }

    set comp(c) {
        if (!c && this._comp) {
            this._comp.delInst(this);
        }
        this._comp = c;

        if (this._comp) {
            this._comp.addInst(this);
        }

        this.onComponentChanged();

        this.stageChange();
    }

    get position() {
        return this.getPosition();
    }

    movable() {
        return this._comp.movable();
    }

    get canCopy() {
        return true;
    }

    assign(source) {
        super.assign(source);

        this.comp = source._comp;
        if (source._host && source._host.openingProd) {
            this._host = source._host.copy();
            this._host.openingProd = this;
        }
        else {
            this._host = source._host;
        }
        this._layout = JSON.parse(JSON.stringify(source._layout));
    }

    copy() {
        const inst = new ComponentInstance();
        inst.assign(this);

        ProdSet.self(this.design).add(inst);
        return inst;
    }

    deserialize(data, metaData) {
        super.deserialize(data);
        this._comp = data.comp;
        if (data.layout) {
            this._layout = data.layout;
        }
        switch (metaData.schemaVersion) {
            case 0:
                if (data.linkedEntity) {
                    this._host = data.linkedEntity;
                }
                break;
            case 1:
                if (data.host) {
                    this._host = data.host;
                }
                break;
            default:
                console.error('lost schemaVersion');
                break;
        }
    }

    onComponentChanged() {
        if (this._host && this._host instanceof Opening) {
            this.calMtxFromLinkEntity();
        }
        this.stageChange();
    }

    notifyRemoved() {
        this.onDelete(this.design);
        super.notifyRemoved();
    }

    onDelete(doc) {
        if (this._comp) {
            this._comp.delInst(this);
            if (this._comp.cis.length < 1) {
                doc.delComp(this._comp.refKey);
            }
        }
        this._comp = undefined;
        if (this.room) {
            this.room.moveOut(this);
        }

        if (this._host) {
            this.unsubscribeTo(this._host);
        }
    }

    calMtxFromLinkEntity() {
        return importUtils.calMtxlocal(this._host).then(mtx => {
            this.mtxLocal.fromArray(mtx);
            this.stageChange();
            this.dirty = DirtyType.All;
        });
    }

    serializedData() {
        let obj = super.serializedData();
        let assigndata = {
            comp: this._comp,
            layout: this._layout
        };
        if (this._host) {
            assigndata.host = this._host;
        }
        return Object.assign(obj, assigndata);
    }

    onLinkedEntities() {
        let arr = super.onLinkedEntities();
        arr.push(this._comp);
        if (this._host) {
            arr.push(this._host);
        }
        return arr;
    }

    stageChange() {
        // if (this._comp) {
        //     this._comp.stageChange();
        // }
        super.stageChange();
    }

    onFixLink(entityMap) {
        super.onFixLink(entityMap);
        if (this._comp) {
            this._comp = entityMap.get(this._comp);
        }
        if (this._host) {
            this.host = entityMap.get(this._host);
        }
    }

    onPostLoad() {
        super.onPostLoad();
        this._calMtxLocal();
        this.subscribeTo(this._host);
    }

    _calMtxLocal() {
        if (this._host && this._host.openingProd && this._host.openingProd.comp) {
            importUtils.calMtxlocal(this._host).then(mtx => {
                this.mtxLocal.fromArray(mtx);
            }).catch(err => { console.log(err) });
        }
    }

    getChangablePropertys() {
        const transform = new THREE.Vector3();
        const quaternion = new THREE.Quaternion();
        let scale = new THREE.Vector3();
        this.mtxLocal.decompose(transform, quaternion, scale);

        let rtValue = [];
        let bShowBoxSize = assetLibCodec.showBoxInfo(this.comp.prodInfo);
        if (bShowBoxSize) {
            const prodInfo = this.comp.prodInfo;
            let srcProdBox = new THREE.Vector3(prodInfo.boundWidthX, prodInfo.boundHeightY, prodInfo.boundDepthZ);
            let bBoxSize = srcProdBox.clone();
            bBoxSize.multiply(scale);

            rtValue.push(UsePropChangeController(new InputParameterUI(),
                '长度',
                bBoxSize.x,
                'mm',
                (value) => {
                    TransactionManager.beginTransaction('Update product');
                    this.stageChange();
                    scale.x = value / srcProdBox.x;
                    this.mtxLocal.compose(transform, quaternion, scale);
                    this.dirty = DirtyType.All;
                    TransactionManager.endTransaction();
                    EventsManager.instance().dispatch(Events.prodTransformEnded, { object: this });
                },
                false
            ));
            rtValue.push(UsePropChangeController(new InputParameterUI(),
                '宽度',
                bBoxSize.y,
                'mm',
                (value) => {
                    TransactionManager.beginTransaction('Update product');
                    this.stageChange();
                    scale.y = value / srcProdBox.y;
                    this.mtxLocal.compose(transform, quaternion, scale);
                    this.dirty = DirtyType.All;
                    TransactionManager.endTransaction();
                    EventsManager.instance().dispatch(Events.prodTransformEnded, { object: this });
                },
                false
            ));
            rtValue.push(UsePropChangeController(new InputParameterUI(),
                '高度',
                bBoxSize.z,
                'mm',
                (value) => {
                    TransactionManager.beginTransaction('Update product');
                    this.stageChange();
                    scale.z = value / srcProdBox.z;
                    this.mtxLocal.compose(transform, quaternion, scale);
                    this.dirty = DirtyType.All;
                    TransactionManager.endTransaction();
                    EventsManager.instance().dispatch(Events.prodTransformEnded, { object: this });
                },
                false
            ));
        }

        if (!assetLibCodec.isDoorOrWindow(this.comp.prodInfo)) {
            rtValue.push(UsePropChangeController(new InputParameterUI(),
                '离地高度',
                transform.z,
                'mm',
                (value) => {
                    if (this.movable()) {
                        TransactionManager.beginTransaction('Update product');
                        this.stageChange();
                        transform.z = value;
                        this.mtxLocal.compose(transform, quaternion, scale);
                        this.dirty = DirtyType.All;
                        TransactionManager.endTransaction();
                        EventsManager.instance().dispatch(Events.prodTransformEnded, {
                            object: this
                        });
                    }
                },
                false
            ));
        }

        return rtValue;
    }

    static make() {
        let inst = new ComponentInstance();
        return inst;
    }

    onRemoved() {
        super.onRemoved();
        if (this._host) {
            this.unsubscribeTo(this._host);
        }
    }

    serializedMetaData() {
        return {
            className: 'ComponentInstance',
            schemaVersion: 1
        };
    }
}

export { ComponentInstance }