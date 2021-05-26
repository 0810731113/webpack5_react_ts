import bimhomeConfig from '../../config/bimhomeconfig';
// import Axios from 'axios';
import { Axios } from '../apicommon';
import { Utils_isArray, ApiUtils_CheckArray, Utils_findFirstElementTypeInArray } from '../apiutils';
import { teamapi } from './teamapi';

const  PermissionResourceType = {
    Trust: 'Trust',
    TrustBy: 'TrustBy'
}

const permissionapi = {

    queryAuthFolderByTeam(shareId, consumeId) {
        let body = {
            owner: shareId,
            ownerType: 'Team',
            visitor: consumeId,
            visitorType: 'Team'
        }

        return Axios.post(`${bimhomeConfig.CdgUrl}/permission/query`, body).then((res) => {
            return Utils_findFirstElementTypeInArray(res, 'resourceId', '无符合条件的权限内容')
        });
    },
    queryPermissionResourceByTeam(teamId, type = PermissionResourceType.Trust) {
        return Axios.get(`${bimhomeConfig.CdgUrl}/teams/${teamId}/permissionResource?type=${type}`);
    },
    createTrustTeams(teamId, trustTeamId) {
        return Axios.post(`${bimhomeConfig.CdgUrl}/teams/${teamId}/trustTeams/${trustTeamId}`);
    },
    deleteTrustTeams(teamId, trustTeamId) {
        return Axios.delete(`${bimhomeConfig.CdgUrl}/teams/${teamId}/trustTeams/${trustTeamId}`);
    }

}

export { permissionapi, PermissionResourceType }