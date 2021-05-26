import bimhomeConfig from '../../config/bimhomeconfig';
// import Axios from 'axios';
import { Axios } from '../apicommon';
import { folderapi, FOLDERTYPE } from './folderapi';
import { Utils_findFirstElementTypeInArray, Utils_isArray, ApiUtils_CheckArray } from '../apiutils';

const UserStatus = {
    Working: 'Working',
    Paused: 'Paused'
}

const userapi = {

    findUsers(body) {
        return Axios.post(`${bimhomeConfig.CdgUrl}/users/query`, body).then((res) => {
            return ApiUtils_CheckArray(res)
        });
    },


    getUsersByProjectId(projectId) {

        return Axios.get(`${bimhomeConfig.CdgUrl}/projects/${projectId}/users`).then((res) => {
            return ApiUtils_CheckArray(res);
        });
    },

    getUserTeamsByProjectId(projectId, userId) {
        return Axios.get(`${bimhomeConfig.CdgUrl}/users/${userId}/projects/${projectId}/teams`).then((res) => {
            return ApiUtils_CheckArray(res);
        });
    },

    getUsersByTeam(teamId) {
        return Axios.get(`${bimhomeConfig.CdgUrl}/teams/${teamId}/users`).then((res) => {
            return ApiUtils_CheckArray(res);
        });
    },

    addProjectUser(projectId, userId) {
        return Axios.post(`${bimhomeConfig.CdgUrl}/projects/${projectId}/users`, [userId])
    },

    addTeamUser(teamId, userId) {
        return Axios.post(`${bimhomeConfig.CdgUrl}/teams/${teamId}/users`, [userId])
    },

    removeTeamUser(teamId, userId) {
        return Axios.delete(`${bimhomeConfig.CdgUrl}/teams/${teamId}/users/${userId}`).then((res) => {

            let code = res.data.code;
            if (code !== 10000) {
                alert(`api error: ${res.data.msg}`);
                return Promise.resolve(res.data.msg);

            } else {
                return res
            }
        })
    },
    queryUsersByIds(body) {
        return Axios.post(`${bimhomeConfig.CdgUrl}/users/ids/batch`, body);
    }
}

export { UserStatus, userapi }