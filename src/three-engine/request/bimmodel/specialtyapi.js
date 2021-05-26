import bimhomeConfig from '../../config/bimhomeconfig';
// import Axios from 'axios';
import { Axios } from '../apicommon';
import { folderapi, FOLDERTYPE } from './folderapi';
import { Utils_findFirstElementTypeInArray, Utils_isArray, ApiUtils_CheckArray } from '../apiutils';


const specialtyapi = {

    querySpecialty(projectId) {
        let body = {
            projectId: projectId
        }

        return Axios.post(`${bimhomeConfig.CdgUrl}/specialties/query`, body).then((res) => {
            return ApiUtils_CheckArray(res)
        });
    }


    // getUsersByProjectId(projectId) {

    //     return Axios.get(`${bimhomeConfig.CdgUrl}/users/project/${projectId}`);
    // },

    // getUsersByTeams(teamId) {
    //     return Axios.get(`${bimhomeConfig.CdgUrl}/users/team/${teamId}`);
    // }

}

export { specialtyapi }