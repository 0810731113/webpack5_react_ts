import bimhomeConfig from '../../config/bimhomeconfig';
//import Axios from 'axios';
import { Axios } from '../apicommon';
import { splitFileName } from '../../app/ui/utils/common';
import bftokenapi from '../bimface/bftokenapi';
import { ApiUtils_CheckObj, ApiUtils_CheckArray } from '../apiutils';

const DatasetStatus = {
    Working: 'Working',
    Paused: 'Paused'
}

const datasetapi = {

    getDataset(dsId) {
        return Axios.get(`${bimhomeConfig.CdgUrl}/dataset?datasetId=${dsId}`);
    },
    deleteDataset(dsId) {
        return Axios.delete(`${bimhomeConfig.CdgUrl}/dataset?datasetId=${dsId}`).then((res) => {
            let code = res.data.code;
            if (code !== 10000) {
                alert(`api error: ${res.data.msg}`);
                return Promise.resolve(res.data.msg);

            } else {
                return res
            }
        });
    },

    createDataset(name, type, folderId, description, ownerId, specialtyId) {

        let data = { folderId, name, type, description, ownerId, specialtyId }

        return Axios.put(bimhomeConfig.CdgUrl + '/dataset', data).then((res) => {
            return res.data
        });
    },

    modifyDataset(dsId, body) {
        //name, description, specialtyId

        return Axios.put(`${bimhomeConfig.CdgUrl}/dataset/${dsId}`, body)
    },

    modifyDatasetStatus(dsId, status) {
        let body = {
            status: status
        }
        return Axios.put(`${bimhomeConfig.CdgUrl}/dataset/${dsId}`, body)
    },

    createWebFileDataset(fileName, folderId) {

        let data = {
            folderId: folderId,
            name: splitFileName(fileName).name,
            nameSpace: 'mymNS',
            schemaDefinition: 'mymSD',
            tipVersion: 0,
            type: splitFileName(fileName).type
        }

        return Axios.put(bimhomeConfig.CdgUrl + '/dataset', data);
    },

    createVersionForDs(dsId, ossfilepath) {
        let url = `${bimhomeConfig.CdgUrl}/dataset/${dsId}/version?sourceFile=${encodeURIComponent(ossfilepath)}`;
        return Axios.put(url, {});
    },

    getFileIdForVersion(versionId) {
        let url = `${bimhomeConfig.CdgUrl}/version/${versionId}/meta?key=fileId`;
        return Axios.get(url);
    },

    getProcessIdForVersion(versionId) {
        let url = `${bimhomeConfig.CdgUrl}/version/${versionId}/meta?key=processId`;
        return Axios.get(url);
    },

    getProcessStatusForVersion(versionId) {
        let url = `${bimhomeConfig.CdgUrl}/version/${versionId}/meta?key=status`;
        return Axios.get(url);
    },

    getModelTree(dsId, versionId) {
        let url = `${bimhomeConfig.CdgUrl}/dataSets/${dsId}/versions/${versionId}/tree`;
        return Axios.get(url).then((res) => {
            return ApiUtils_CheckObj(res)
        });
    },

    getDsSubId(dsId) {
        let url = `${bimhomeConfig.CdgUrl}/dataset/project-sub-id?datasetId=${dsId}`;
        return Axios.get(url).then((res) => {
            return res.data;
        });
    },


    getViewTokenForVersion(versionId) {

        return this.getFileIdForVersion(versionId).then((res) => {
            let fileId = res.data;

            if (fileId) {
                return bftokenapi.getViewToken(fileId).then((rt) => {
                    let viewToken = rt.data.data;
                    if (viewToken) {
                        return Promise.resolve({
                            viewToken: viewToken,
                            fileId: fileId
                        });
                    } else {
                        return Promise.reject(`bimface load viewToken error for fileId ${fileId}`)
                    }
                })
            } else {
                return Promise.reject(`no fileId found for version ${versionId}`)
            }
        })
    },

    getDatasetsBySpecialtyId(specialtyId) {
        let url = `${bimhomeConfig.CdgUrl}/datasets/specialty?specialtyId=${specialtyId}`;
        return Axios.get(url).then((res) => {
            return ApiUtils_CheckArray(res);
        });
    }
}

export { DatasetStatus, datasetapi } 