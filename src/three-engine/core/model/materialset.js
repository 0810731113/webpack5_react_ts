import { entityTypes } from './entitytypes';
import { Material } from './material';
import { MaterialLoader } from '../loader/materialloader';
import bimhomeConfig from '../../config/bimhomeconfig';
import { EntitySet } from './entityset';

class MaterialSet extends EntitySet {
    constructor() {
        super(entityTypes.MaterialSet);
    }

    static self(design) {
        return design.getBestEntity(entityTypes.MaterialSet);
    }

    static kids(design) {
        return EntitySet.getKids(design, entityTypes.MaterialSet);
    }

    static setup(design) {
        let p = MaterialSet.self(design);
        if (!p) {
            p = new MaterialSet();
            design.addEntity(p);
        }
        return p;
    }

    stageChange() {
        this._entities.forEach(itr => {
            itr.stageChange();
        });
        super.stageChange();
    }

    lookup(id) {
        let material = null;
        for (let i = 0; i < this._entities.length; i++) {
            let mat = this._entities[i];
            if (mat.id == id) {
                material = mat;
                break;
            }
        }
        return material;
    }

    add(material) {
        if (this.lookup(material.id) == null) {
            material.design = this.design;
            this._entities.push(material);
            material.stageChange();
        }
    }

    loadMaterial(url) {
        let material = new Material();
        material.id = url;
        this.add(material);
        let materialloader = new MaterialLoader(material);
        materialloader.load({ url: url, credential: bimhomeConfig.DavCredential });
        this.stageChange();
        return material;
    }

    loadMaterialFromProdInfo(prodInfo) {
        if(prodInfo.prodId && prodInfo!=='') {
            let material = this.lookup(prodInfo.prodId);
            if(material== null || material == undefined) {
                material = new Material();
                material.id = prodInfo.prodId;
                material.materialMeta = {schemaVersion: prodInfo.schemaVersion};
                material.loadingProdInfo = prodInfo;
                this.add(material);
                this.stageChange();
            }
            return material;
        }

        return null;
    }

    serializedMetaData() {
        return {
            className: 'MaterialSet',
            schemaVersion: 0
        };
    }

    static make() {
        let p = new MaterialSet();
        return p;
    }
}

export { MaterialSet }