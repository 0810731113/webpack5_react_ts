import bimhomeConfig from '../../config/bimhomeconfig';
// import Axios from 'axios';
import { Axios } from '../apicommon';
import { teamapi } from './teamapi';
import { Utils_findFirstElementTypeInArray, ApiUtils_CheckArray } from '../apiutils';

const FOLDERTYPE = {
    ProjectFiles: 'ProjectFile',
    Proofreading: 'Proofreading',
    ProjectShare: 'ProjectShare',
    TeamRelated: 'TeamRelated',
    Process: 'Process',
    Publish: 'Published',
    Consume: 'Consume',
    ConsumeTeamRelated: 'ConsumeTeamRelated',
    OtherFiles: 'OtherFiles'
}

const folderapi = {

    getFolderByProject(projectId) {
        return Axios.get(bimhomeConfig.CdgUrl + '/folder/byproject?projectId=' + projectId).then((res) => {
            return ApiUtils_CheckArray(res)
        });
    },

    getDsByFolder(folderId) {
        return Axios.get(bimhomeConfig.CdgUrl + '/dataset/byfolder?folderId=' + folderId);
    },

    getLatestVersionForDs(dsId) {
        return Axios.get(bimhomeConfig.CdgUrl + '/dataset/' + dsId + '/version/latest');
    },

    getVersionsForDs(dsId) {
        return Axios.get(bimhomeConfig.CdgUrl + '/dataset/' + dsId + '/versions').then((res) => res.data);
    },

    createFolder(data) {
        return Axios.put(bimhomeConfig.CdgUrl + '/folder', data);
    },

    renameFolder(folderId, name) {
        return Axios.post(`${bimhomeConfig.CdgUrl}/folder?folderId=${folderId}&name=${name}`, {});
    },

    deleteFolder(folderId) {
        return Axios.delete(`${bimhomeConfig.CdgUrl}/folder?folderId=${folderId}`);
    },

    filterFolders(folderType, projectId, parentId) {
        let body = {
            folderType: folderType,
            projectId: projectId,
            parentId: parentId
        }
        return Axios.post(`${bimhomeConfig.CdgUrl}/folders`, body).then((res) => {
            return ApiUtils_CheckArray(res)
        })
    },

    //功能性api
    createSubFolderForTeam(parentId, projectId) {

        let sub1 = {
            name: '草稿',
            parentId: parentId,
            projectId: projectId,
            folderType: FOLDERTYPE.Process
        }

        let sub2 = {
            name: '提交',
            parentId: parentId,
            projectId: projectId,
            folderType: FOLDERTYPE.Publish
        }

        let sub3 = {
            name: '其它文档',
            parentId: parentId,
            projectId: projectId,
            folderType: FOLDERTYPE.OtherFiles
        }

        let p1 = this.createFolder(sub1);
        let p2 = this.createFolder(sub2);
        let p3 = this.createFolder(sub3);

        return Promise.all([p1, p2, p3])
    },

    findTypeFolderIdByParentId(type, parentId) {
        if (parentId) {
            return this.filterFolders(type, null, parentId).then((folders) => {
                return Utils_findFirstElementTypeInArray(folders, 'id', `无符合条件folderId (findTypeFolderIdByParentId)`)
            })
        } else {
            return Promise.reject(`parentId 为空(findTypeFolderIdByParentId)`)
        }
    },

    findTypeFolderIdByTeam(type, teamId) {
        if (teamId) {
            return teamapi.findTeamRelatedFolder(teamId).then((linkedFdId) => {
                return this.findTypeFolderIdByParentId(type, linkedFdId);
            })
        } else {
            return Promise.reject(`teamId 为空 (findTypeFolderIdByTeam)`)
        }
    },

    loadDsByFolder(folderId) {
        return this.getDsByFolder(folderId).then((res) => {

            let data = res.data;

            let promises = []

            for (let ds of data) {
                let p = folderapi.getVersionsForDs(ds.id).then((versions) => {
                    ds.versions = versions;
                })
                promises.push(p)
            }

            return Promise.all(promises).then(() => {
                return data;
            })
        })
    }


}

export { FOLDERTYPE, folderapi }