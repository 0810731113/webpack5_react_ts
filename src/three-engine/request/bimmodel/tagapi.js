import bimhomeConfig from '../../config/bimhomeconfig';
// import Axios from 'axios';
import { Axios } from '../apicommon';
import { ApiUtils_CheckArray } from '../apiutils';
import { datasetapi } from './datasetapi';
import { folderapi, FOLDERTYPE } from './folderapi';

const NameSpaceType = {
    Dataset: 'DataSet',
    Version: 'Version',
    Project: 'Project'
}

//需要干的事情的类型是，空数据集打标签
const FunctionType = {
    Initialize: 'Initialize',
    Status: 'Status'
}

const InitializeDataType = {
    Initialized: 'Initialized',
    Uninitialized: 'Uninitialized'
}

const tagapi = {

    tagDataset(dsId) {
        let body = {
            targetId: dsId,

            targetNamespace: NameSpaceType.Dataset,
            type: FunctionType.Initialize,
            data: InitializeDataType.Initialized
        }

        return Axios.put(`${bimhomeConfig.CdgUrl}/tag`, body).then((res) => {
            return res.data
        });
    },

    getEmptyDatasetsByFolder(folderId) {
        let body = {
            targetNamespace: NameSpaceType.Dataset,
            type: FunctionType.Initialize,
            data: InitializeDataType.Initialized
        }

        return Axios.post(`${bimhomeConfig.CdgUrl}/dataset/bytag?folderId=${folderId}`, body).then((res) => {

            return ApiUtils_CheckArray(res);
        });
    },

    createEmptyDataset(name, description, folderId, ownerId, specialtyId) {
        return datasetapi.createDataset(name, 'cloudify', folderId, description, ownerId, specialtyId).then((data) => {
            return this.tagDataset(data.id)
        })
    },

    createDatasetTreeNode(linkedFolderId, dsName, dsDescription, ownerId, specialtyId) {
        return folderapi.findTypeFolderIdByParentId(FOLDERTYPE.Process, linkedFolderId).then((folderId) => {

            //处理同名工作单元
            return folderapi.getDsByFolder(folderId).then((res) => {
                let arr = res.data;

                let name = dsName;
                while (arr.find((item) => item.name === name)) {
                    name = name + ' (1)'
                }

                return this.createEmptyDataset(name, dsDescription, folderId, ownerId, specialtyId)
            })


        })
    }
}

export { NameSpaceType, FunctionType, InitializeDataType, tagapi }