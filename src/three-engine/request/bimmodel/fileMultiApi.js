import bimhomeConfig from '../../config/bimhomeconfig';
import axios from 'axios';
import { Axios } from '../apicommon';
import { datasetapi } from './datasetapi';
import { workerapi } from './workerapi';

const BytesPerPiece = 5 * 1024 * 1024;
const MaxProcess = 2;

function FileReaderPromise(chunk) {

    return new Promise((resolve, reject) => {

        if (chunk === 'success') {
            resolve('success')
        } else {
            let reader = new FileReader();
            reader.readAsArrayBuffer(chunk);

            reader.onloadend = (e) => {
                resolve(reader.result)
            }
            reader.onerror = (err) => reject(err);
        }
    })
}

class FileMultiApi {
    constructor(name, type, folderId, dsId) {
        this._uploadId = null;
        this._fileKey = null;
        this._etags = null;
        this._curIndex = 0;
        this._name = name;
        this._type = type;
        this._folderId = folderId;
        this._dsId = dsId;
    }

    set name(name) {
        this._name = name;
    }

    get name() {
        return this._name;
    }

    get fullName() {
        return this._name + '.' + this._type
    }

    set fileData(fileData) {
        this._fileData = fileData;
        this._totalPieces = Math.ceil(this._fileData.size / BytesPerPiece);
    }

    set existedDs(existedDs) {
        this._existedDs = existedDs;
    }

    initMulti() {
        let url = `${bimhomeConfig.CdgUrl}/file/multi/region/init?fileName=${encodeURIComponent(this.fullName)}`;

        return Axios.put(url).then((res) => {
            //return (res.data) //之后改
            this.fileKey = res.data.fileOSSPath;
            this.uploadId = res.data.multiPartUploadId;
            this.etags = {};
            // return Axios.post(res.data.fileUrlWithSAS).then((rt) => {
            //     //console.log(rt.data);
            //     return getUPloadIdFromXml(rt.data)

            // })
        })
    }

    putMultiFile(partNumber, arrayByte) {

        let url = `${bimhomeConfig.CdgUrl}/file/multi/region/put?fileKey=${encodeURIComponent(this.fileKey)}&partNumber=${partNumber}&uploadId=${this.uploadId}`;

        return Axios.get(url).then((res) => {
            let url = res.data.fileUrlWithSAS;

            let instance = axios.create({
                headers: { 'Content-Type': '' }
            });

            return instance.put(url, arrayByte).then((res) => {
                this.etags[res.headers.etag] = partNumber;
            });
        })
    }


    mergeMulti() {
        let url = `${bimhomeConfig.CdgUrl}/file/multi/region/merge?fileKey=${encodeURIComponent(this.fileKey)}&uploadId=${this.uploadId}`;

        return Axios.put(url, this.etags)
    }

    getNextPromise(callback) {

        this._curIndex++;

        let percent = this._curIndex / this._totalPieces * 100;
        if (percent > 100) percent = 100

        callback(percent.toFixed(2));

        if (this._totalPieces < this._curIndex) {
            return FileReaderPromise('success')
        } else {
            let chunk = this._fileData.slice(BytesPerPiece * (this._curIndex - 1), this._curIndex === this._totalPieces ? this._fileData.size : BytesPerPiece * this._curIndex);

            let p = (index) => {
                return FileReaderPromise(chunk).then((arrayByte) => {
                    return this.putMultiFile(index, arrayByte).then(() => {
                        return this.getNextPromise(callback)
                    })
                })
            }

            return p(this._curIndex);
        }
    }

    doMultiUpload(callback) {

        return this.initMulti().then(() => {

            let p = []

            for (let ind = 0; ind < MaxProcess; ind++) {
                p.push(this.getNextPromise(callback))
            }

            return Promise.all(p)
            //return this.getNextPromise(callback)
        }).then((res) => {

            //console.log(res); //['success']
            return this.mergeMulti().then((res2) => {

                if (res2.data.code === 10000) {
                    return {
                        fileOSSPath: this.fileKey
                    }
                } else {
                    return Promise.reject('error')
                }
            })
        })
    }

    createVersion(dsId, osspath) {
        return datasetapi.createVersionForDs(dsId, osspath).then((res) => {
            return workerapi.startWorkder(res.data.id, this._type)
        })
    }

    createDs(osspath) {
        return datasetapi.createWebFileDataset(this.fullName, this._folderId).then((res) => {

            let dsId = res.data.id;

            return datasetapi.createVersionForDs(dsId, osspath).then((res) => {
                return workerapi.startWorkder(res.data.id, this._type)
            })
        })
    }

    afterUpload(osspath) {
        if (this._dsId) {
            return this.createVersion(this._dsId, osspath)
        } else if (this._existedDs) {
            return this.createVersion(this._existedDs.id, osspath)
        } else {
            return this.createDs(osspath)
        }
    }
}

export { FileMultiApi }