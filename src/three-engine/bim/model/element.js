import * as THREE from 'three'
import Entity from '../../core/model/entity';
import { entityTypes } from '../../core/model/entitytypes';
import { Asset } from './asset';
import { gdcDbConnector } from './dbconnector';
import { DirtyType } from '../../core/display/dirtytype';
import { Body } from '../../core/model/brep/body';
import { Component } from '../../core/model/component';

class Element extends Entity {
    constructor() {
        super(entityTypes.Element);
        this._comp = null;
        this._asset = null;
        this._schemaType = null;
    }

    get schemaType() {
        return this._schemaType;
    }

    set schemaType(p) {
        this._schemaType = p;
    }

    get comp() {
        return this._comp;
    }

    get asset() {
        return this._asset;
    }

    load(data) {
        return new Promise((resolve, reject) => {
            data.aspects.forEach(itr => {
                this._loadAspect(itr).then(() => {
                    resolve();
                }).catch(err => reject(err));
            });
        });
    }

    onFrameRendered() {
        this.dirty = DirtyType.Nothing;
    }

    _loadAspect(data) {
        return new Promise((resolve, reject) => {
            switch (data.aspectKey) {
                case 'aspect-geometry':
                    this._loadGeometry(data).then(() => {
                        resolve();
                    }).catch(err => reject(err));
                    break;
                case 'aspect-common-property':
                case 'aspect-bim-param':
                    this._loadAsset(data);
                    resolve();
                    break;
            }
        });
    }

    _loadAsset(data) {
        this._asset = new Asset();
        this._asset.parent = this;
        this._asset.load(data);
    }

    _loadGeometry(data) {
        return new Promise((resolve, reject) => {
            let path = data.aspectData;
            gdcDbConnector.getSASForRead(path).then((res) => {
                let loader = new THREE.FileLoader();
                let url = res.data.fileUrlWithSAS;
                loader.load(url, (text) => {
                    let json = JSON.parse(text);
                    let body = new Body();
                    body.build(json);
                    this._comp = new Component();
                    this._comp.body = body;
                    this.dirty = DirtyType.All;
                    this.notifyAdded();
                    resolve();
                });
            }).catch(err => reject(err));
        });
    }
}

export { Element }