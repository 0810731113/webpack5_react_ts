import axios from 'axios';
import fileUrlType from './fileurltype';
import dynamicConfig from '../../config/dynamicConfig';
const format = require('string-format')

class FileStoreHelper {
    constructor(fileserviceUrl) {
        this._serverUrl = fileserviceUrl;
        this.TemplateUrl = {
            GetFile: {Url: '/file/{0}/{1}/version/{2}', Method: 'GET'},
            GetSAS: {Url: '/sas/forread', Method: 'POST'},
            NewFile: {Url: '/file/{0}/{1}/new', Method: 'PUT'},
            HealthProbe: {Url: '/health', Method: 'GET'}
        };
    }

    saveFile(namespace, fileId, arrayByte) {
        namespace = encodeURI(namespace);
        fileId = encodeURI(fileId);
        return this.newFile(namespace, fileId)
            .then(res => {
                let config = {
                    headers: { 'Content-Type': '' },
                };
                return axios.put(res.data.fileUrlWithSAS, arrayByte,config).then(res2 => {
                    return res;
                });
            })
            .catch(err => {
                console.error(`failed to save file for ${namespace}:${fileId} with error ${err}`);
                throw err;
            });
    }

    readFile(namespace, fileId, fileVersion) {
        namespace = encodeURI(namespace);
        fileId = encodeURI(fileId);
        return this.getFile(namespace,fileId,fileVersion)
            .then(res=>
            {
                return axios.get(res.data.fileUrlWithSAS).then(fileResp=>
                {
                    return fileResp.data;
                })
            })
            .catch(err => {
                console.error(`failed to read file for ${namespace}:${fileId}:${fileVersion} with error ${err}`);
                throw err;
            });
    }

    getOSSUrl(filepath) {

        return this.getSASFile(filepath)
            .then(res=>
            {

                return res.data.fileUrlWithSAS;
            })
            .catch(err => {
                console.error(`failed to read file for ${filepath} with error ${err}`);
                throw err;
            });
    }

    readPathFile(filepath, responseType) {
        if(responseType == undefined || responseType == null)
        {
            responseType = 'arraybuffer';
        }

        return this.getSASFile(filepath)
            .then(res=>
            {
                let config = {
                    responseType: responseType
                };

                return axios.get(res.data.fileUrlWithSAS,config).then(fileResp=>
                {
                    return fileResp.data;
                })
            })
            .catch(err => {
                console.error(`failed to read file for ${filepath} with error ${err}`);
                throw err;
            });
    }

    readPathFileToLocal(filepath, responseType,fileurltype){
        if(fileurltype === fileUrlType.DirectPath){
            return Promise.resolve(filepath);
        }
        else {
            let readFile = FileStoreHelper.getFileReader(fileurltype);

            return readFile(filepath, responseType).then(data => {
                const blob = new Blob([data]);
                let localUrl = window.URL.createObjectURL(blob);

                return localUrl;
            }).catch(err => {
                console.error(`failed to read file for ${filepath} with error ${err}`);
                throw err;
            });
        }
    }

    healthProbe() {
        let url = format('{0}{1}',this._serverUrl,this.TemplateUrl.HealthProbe.Url);
        return axios.get(url);
    }

    newFile(namespace, fileId) {
        let url = format('{0}{1}',this._serverUrl,format(this.TemplateUrl.NewFile.Url,namespace,fileId));
        let config = {
            headers: { 'Authorization': dynamicConfig.fileServiceToken },
        };
        return axios.put(url,null, config);
    }

    getFile(namespace,fileId,versionId) {
        let url = format('{0}{1}',this._serverUrl,format(this.TemplateUrl.GetFile.Url,namespace,fileId,versionId));
        let config = {
            headers: { 'Authorization': dynamicConfig.fileServiceToken },
        };
        return axios.get(url,config);
    }

    getSASFile(filepath)
    {
        let config = {
            headers: { 'Content-Type': 'application/json',
                'Authorization': dynamicConfig.fileServiceToken },
        };

        let url = format('{0}{1}',this._serverUrl,this.TemplateUrl.GetSAS.Url);
        return axios.post(url,filepath,config);
    }

    static getFileReader(urltype){
        if(urltype === fileUrlType.InternalOssPath){
            return FileStoreHelper.readFilePathOfFileStore;
        }
        else if(urltype === fileUrlType.DirectPath){
            return FileStoreHelper.readFilePathDirectly;
        }
        else{
            return FileStoreHelper.readFilePathOfFileStore;
        }
    }

    static get DefaultFileStoreHelper()
    {
        return new FileStoreHelper(dynamicConfig.fileManagerUrl);
    }

    static readFilePathOfFileStore(filepath, responseType)
    {
        return FileStoreHelper.DefaultFileStoreHelper.readPathFile(filepath,responseType);
    }

    static readFilePathDirectly(dirFilepath, responseType)
    {
        if(responseType == undefined || responseType == null)
        {
            responseType = 'arraybuffer';
        }

        let config = {
            responseType: responseType
        };

        return axios.get(dirFilepath,config).then(fileResp=>
        {
            return fileResp.data;
        }).catch(err => {
            console.error(`failed to read file for ${dirFilepath} with error ${err}`);
            throw err;
        });

    }
}
export { FileStoreHelper };
