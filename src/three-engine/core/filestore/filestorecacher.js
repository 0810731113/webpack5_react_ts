import { FileStoreHelper } from './filestorehelper';

class VFileCache {
    constructor(id, cache/*, keepRequire = false*/){
        this._pathID = id;
        this._localCache = cache;
        this._lastUse = new Date();
        this._frequency = 1;
        //this._keepRequire = keepRequire;
    }

    UseCache() {
        let now = new Date();
        let diff = now - this._lastUse;
        this._lastUse = now;
        if( this._frequency != 1 ){
            this._frequency = ( this._frequency + 1 / diff ) / 2;
        } else {
            this._frequency = 1 / diff;
        }
        return this._localCache;
    }

    Release(){
        window.URL.revokeObjectURL(this._localCache);
    }
}

class VFileStoreCacher {
    constructor(){
        this._fileList = new Map();
    }

    GetFileLocalPath(urlPath, responseType, fileurltype){
        if(!this._fileList[urlPath]){
            return new Promise((resolve, reject) => {
                FileStoreHelper.DefaultFileStoreHelper.readPathFileToLocal(urlPath, responseType, fileurltype)
                    .then(localFilePath => {
                        this._fileList[urlPath] = new VFileCache(urlPath, localFilePath);
                        resolve(localFilePath);
                    }).catch(reject);
            });
        } else {
            return new Promise((resolve, reject) => {
                resolve(this._fileList[urlPath].UseCache());
            });
        }
    }

    ReleaseHalfByFreq(){
        let dataArray = [];
        this._fileList.forEach((value, key, map) => {
            dataArray.push({ id: key, freq: value._frequency });
        });

        dataArray.sort((a, b) => {
            return a - b;
        })

        let rmlength = Math.floor( dataArray.length / 2 ); 
        for(let i = 0; i < rmlength; i++){
            let key = dataArray[i].id;
            this._fileList[key].Release();
            this._fileList.delete(key);
        }
    }
}

const FileStoreCacher = new VFileStoreCacher();

export { FileStoreCacher }