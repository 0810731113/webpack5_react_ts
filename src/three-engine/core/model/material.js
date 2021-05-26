import Entity from './entity';
import { entityTypes } from './entitytypes';
import { TextureLoader } from '../loader/textureloader';
import {FileStoreHelper as filestorehelper} from '../filestore/filestorehelper';
import fileUrlType from '../filestore/fileurltype';

class Material extends Entity {
    constructor() {
        super(entityTypes.Material);
        this._diffuseTextureFile = null;
        this._bumpTextureFile = null;
        this._width = 0;
        this._height = 0;
        this._diffuseTexture = null;
        this._diffuse = [1,1,1];
        this._specular = [1,1,1];
        this._shininess = 1;
        this._opacity = 1.0;
        this._referenceFiles = [];
        this._id = 0;
        this._materialMeta = null;
        this._loaded = false;
        this._loadedCallback = [];
        this._loadedTextureCallback =[];
    }

    get id() {
        return this._id;
    }

    set id(i) {
        this._id = i;
    }

    get loaded() {
        return this._loaded;
    }

    set loaded(i) {
        this._loaded = i;
        this.loading = false;

        if (this._loaded && this._loadedCallback != null && this._loadedCallback != undefined) {
            this._loadedCallback.forEach(callback => {
                callback();
            });

            this._loadedCallback = [];
        }
    }

    get diffuseTextureFile() {
        return this._diffuseTextureFile;
    }

    set diffuseTextureFile(f) {
        this._diffuseTextureFile = f;
    }

    get bumpTextureFile() {
        return this._bumpTextureFile;
    }

    set bumpTextureFile(f) {
        this._bumpTextureFile = f;
    }

    get width() {
        return this._width;
    }

    set width(w) {
        this._width = w;
    }

    get height() {
        return this._height;
    }

    set height(h) {
        this._height = h;
    }

    get diffuse()
    {
        return this._diffuse;
    }

    set diffuse(d)
    {
        this._diffuse = d;
    }

    get specular()
    {
        return this._specular;
    }

    set specular(s)
    {
        this._specular = s;
    }

    get shininess()
    {
        return this._shininess;
    }

    set shininess(s)
    {
        this._shininess = s;
    }

    get opacity()
    {
        return this._opacity;
    }

    set opacity(o)
    {
        this._opacity = o;
    }

    get diffuseTexture()
    {
        return this._diffuseTexture;
    }

    set diffuseTexture(texture)
    {
        this.loadingTexture = false;
        this._diffuseTexture = texture;

        if (texture && this._loadedTextureCallback != null && this._loadedTextureCallback != undefined) {
            this._loadedTextureCallback.forEach(callback => {
                callback();
            });
        }

        this._loadedTextureCallback = [];
    }

    get referenceFiles(){
        return this._referenceFiles;
    }

    set referenceFiles(refFiles){
        this._referenceFiles = refFiles;
    }

    get materialMeta(){
        return this._materialMeta;
    }

    set materialMeta(m){
        this._materialMeta =m;
    }

    hasTexture()
    {
        return this._diffuseTextureFile!=null && this._diffuseTextureFile!=undefined && this._diffuseTextureFile!='';
    }

    get isExternalMaterial(){
        return (!this._materialMeta) || (this._materialMeta && this._materialMeta.externalProd && this._materialMeta.externalProd == true);
    }

    monitorDiffuseTextureLoad(callback) {
        if (this._diffuseTexture != null && this._diffuseTexture != undefined) {
            callback();
        } else {
            this._loadedTextureCallback.push(callback);
            if (!this.loadingTexture) {
                this.loadTexture();
            }
        }
    }


    loadTexture() {
        if(this.loadingTexture == true || this._diffuseTextureFile==null || this._diffuseTextureFile==undefined)
        {
            return Promise.resolve();
        }

        this.loadingTexture = true;
        let self = this;
        return new Promise((resolve, reject) => {
            if (self._diffuseTexture) {
                self.loadingTexture = false;
                resolve(self._diffuseTexture);
            } else {
                if (self._diffuseTextureFile != null && self._diffuseTextureFile != undefined) {
                    filestorehelper.DefaultFileStoreHelper.readPathFileToLocal(
                        self._diffuseTextureFile,
                        undefined,
                        this.isExternalMaterial? fileUrlType.DirectPath:fileUrlType.InternalOssPath)
                        .then(localTextureFile => {
                            let loader = new TextureLoader();
                            loader.load(localTextureFile).then(itr => {
                                window.URL.revokeObjectURL(localTextureFile);
                                self.diffuseTexture = itr.texture;

                                self.loadingTexture = false;

                                resolve(self._diffuseTexture);
                            }).catch(reject);
                        }).catch(reject);
                }
            }
        });
    }

    clone() {
        let mat = new Material();

        mat._diffuseTextureFile = this._diffuseTextureFile;
        mat._bumpTextureFile = this._bumpTextureFile;
        mat._width = this._width;
        mat._height = this._height;
        mat._diffuseTexture = this._diffuseTexture;
        mat._diffuse = this._diffuse;
        mat._specular = this._specular;
        mat._shininess = this._shininess;
        mat._opacity = this._opacity;
        mat._referenceFiles = this._referenceFiles;
        mat._id = this._id;
        mat._materialMeta = this._materialMeta;
        mat._loaded = this._loaded;
        //mat._loadedCallback = this._loadedCallback;
        //mat._loadedTextureCallback = this._loadedTextureCallback;
        mat.loadingProdInfo = this.loadingProdInfo;

        return mat;
    }

    serializedData() {
        let obj = super.serializedData();
        return Object.assign(obj, {
            width: this._width,
            height: this._height,
            id: this._id,
            diffuse: this._diffuse,
            specular: this._specular,
            shininess: this._shininess,
            opacity: this._opacity,
            diffuseTextureFile: this._diffuseTextureFile,
            bumpTextureFile: this._bumpTextureFile,
            referenceFiles: this._referenceFiles,
            materialMeta:this._materialMeta,
            loaded: this._loaded,
        });
    }

    serializedMetaData() {
        return {
            className: 'Material',
            schemaVersion: 0
        };
    }

    onLinkedEntities() {
        return [];
    }

    onFixLink(entityMap) {
    }

    deserialize(data, metaData) {
        super.deserialize(data, metaData);
        const material = this;
        material.width = data.width;
        material.height = data.height;
        material.id = data.id;
        material.diffuse = data.diffuse;
        material.specular = data.specular;
        material.shininess = data.shininess;
        material.opacity = data.opacity;
        material.diffuseTextureFile = data.diffuseTextureFile;
        material.bumpTextureFile = data.bumpTextureFile;
        material.referenceFiles = data.referenceFiles;
        material.materialMeta = data.materialMeta;
        material.loaded = data.loaded;
    }
    
    static make() {
        let material = new Material();
        return material;
    }

    static makeMaterial(matSet, id, r, g, b, a) {
        let material = new Material();
        material.id = id;
        material.diffuse = [r, g, b];
        material.specular = [1,1,1];
        material.shininess = 1;
        material.opacity = a;
        material.loaded = true;
        matSet.add(material);
        return material;
    }
}

export { Material }