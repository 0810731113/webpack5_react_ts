import bimhomeConfig from '../../config/bimhomeconfig';
//import Axios from 'axios';
import { Axios } from '../apicommon';

const FileStoreApi = {

    newFile(namespace, fileName) {
        //let url = `${bimhomeConfig.CdgUrl}/file/new?filepath=${namespace}&fileName=${fileName}`;
        let url = `${bimhomeConfig.CdgUrl}/file/new?fileName=${fileName}`;
        return Axios.put(url, null);
    },
    saveFile(namespace, fileName, arrayByte) {
        namespace = encodeURI(namespace);
        fileName = encodeURI(fileName);
        return this.newFile(namespace, fileName)
            .then(res => {
                let config = {
                    headers: { 'Content-Type': '' },
                };
                return Axios.put(res.data.fileUrlWithSAS, arrayByte, config).then(res2 => {
                    return res;
                });
            })
            .catch(err => {
                console.error(`failed to save file for ${namespace}:${fileName} with error ${err}`);
                throw err;
            });
    },
    simpleSaveFile(file) {
        var forms = new FormData()
        var configs = {
            headers:{'Content-Type':'multipart/form-data'}
        };
        forms.append('file',file);
        return Axios.put(`${bimhomeConfig.CdgUrl}/file/upload`, forms, configs).then(res => {
            return res;
        });
    },
    getSASFile(osspath) {
        let url = `${bimhomeConfig.CdgUrl}/file/read`;
        return Axios.post(url, osspath);
    }
}

export default FileStoreApi