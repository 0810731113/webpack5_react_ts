import bimhomeConfig from '../../config/bimhomeconfig';
// import Axios from 'axios';
import { Axios } from '../apicommon';
import { folderapi, FOLDERTYPE } from './folderapi';
import { Utils_findFirstElementTypeInArray, Utils_isArray, ApiUtils_CheckArray } from '../apiutils';
import { userapi } from './userapi';

const TeamStatus = {
    Working: 'Working',
    Paused: 'Paused',
}

const teamapi = {
    filterTeams(projectId, myTeam = true) {
        let body = {
            projectId: projectId
        }
        return Axios.post(`${bimhomeConfig.CdgUrl}/teams?myTeam=${myTeam}`, body).then((res) => {
            return ApiUtils_CheckArray(res)
        });
    },

    createTeam(name, status, description, projectId) {

        return folderapi.filterFolders(FOLDERTYPE.ProjectFiles, projectId).then((folders) => {
            return Utils_findFirstElementTypeInArray(folders, 'id', '未找到项目文件夹')
        }).then((linkedFolderId) => {
            let data = {
                name: name,
                projectId: projectId,
                parentId: linkedFolderId,
                folderType: FOLDERTYPE.TeamRelated
            }

            return folderapi.createFolder(data).then((res) => {
                let linkedFdId = res.data.id;

                folderapi.createSubFolderForTeam(linkedFdId, projectId);
                return linkedFdId
            })
        }).then((linkedFdId) => {
            let body = {
                linkedFolderId: linkedFdId,
                name: name,
                status: status,
                description: description,
                projectId: projectId
            }
            return Axios.put(`${bimhomeConfig.CdgUrl}/team`, body);
        })

    },

    updateTeam(id, name, status, description, linkedFolderId) {
        let body = {
            id: id,
            name: name,
            status: status,
            linkedFolderId: linkedFolderId,
            description: description
        }

        return Axios.post(`${bimhomeConfig.CdgUrl}/team/update`, body);
    },

    deleteTeam(id) {
        return Axios.delete(`${bimhomeConfig.CdgUrl}/team?teamId=${id}`).then((res) => {
            let code = res.data.code;
            if (code !== 10000) {
                alert(`api error: ${res.data.msg}`);
                return Promise.resolve(res.data.msg);

            } else {
                return res
            }
        });
    },

    //功能性api
    findTeamRelatedFolder(teamId) {
        let body = {
            id: teamId
        }

        return Axios.post(`${bimhomeConfig.CdgUrl}/teams?myTeam=false`, body).then((res) => {

            return Utils_findFirstElementTypeInArray(res, 'linkedFolderId', '查找team对应的folderId失败')
        })

    },

    findAllOtherTeamIds(selectedTeamId, projectId) {
        return this.filterTeams(projectId, 'false').then((teams) => {

            let teamIds = [];
            if (Utils_isArray(teams)) {

                teams.map((item) => {
                    if (item.id !== selectedTeamId) {
                        teamIds.push(item.id)
                    }
                })
            }
            return teamIds;
        })
    },

    findAllOtherTeamsInfo(selectedTeamId, projectId) {
        return this.filterTeams(projectId).then((teams) => {

            return teams.filter((item) => item !== selectedTeamId);
        })
    },

    getTeamRelatedDatasets(selectedTeamId) {

        return Axios.get(`${bimhomeConfig.CdgUrl}/teams/${selectedTeamId}/dataSets?type=cloudify`).then((res) => {
            return ApiUtils_CheckArray(res)
        });
    },

    getTeamRelatedDatasetsWithUserInfo(selectedTeamId) {
        return this.getTeamRelatedDatasets(selectedTeamId).then((datasets) => {
            let ownerIds = datasets.map((ds) => ds.ownerId);

            return userapi.queryUsersByIds(ownerIds).then((res) => {
                let userInfoArr = ApiUtils_CheckArray(res);

                datasets.forEach(ds => {
                    ds.ownerInfo = userInfoArr.find(user => user.id === ds.ownerId)
                })

                return datasets
            })
        })
    },

    findTeamsByDsIds(dsIds) {

        return Axios.post(`${bimhomeConfig.CdgUrl}/search/teams/bydatasets`, dsIds).then((res) => {
            return ApiUtils_CheckArray(res)
        });
    }
}

export { TeamStatus, teamapi }