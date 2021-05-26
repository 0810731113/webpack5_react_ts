import bimhomeConfig from '../../config/bimhomeconfig';
import { Axios } from '../apicommon';
import { ApiUtils_CheckArray, ApiUtils_CheckObj } from '../apiutils';

const archiveapi = {

    async createArchive(projectId, name, description) {

        let body = {
            description: description,
            name: name,
            projectId: projectId
        }
        let res = await Axios.post(bimhomeConfig.CdgUrl + '/archive-packages', body);
        return ApiUtils_CheckObj(res);
    },

    async getArchivePackage(packageId) {
        let res = await Axios.get(bimhomeConfig.CdgUrl + `/archive-packages/${packageId}`);
        return ApiUtils_CheckObj(res)
    },

    async getAllArchivesByProjectId(projectId) {
        let res = await Axios.get(bimhomeConfig.CdgUrl + `/projects/${projectId}/archive-packages`);
        return ApiUtils_CheckArray(res)
    },

    async getBatchVersions(idArr) {

        let res = await Axios.post(bimhomeConfig.CdgUrl + `/search/archive-packages/versions`, idArr);
        return ApiUtils_CheckObj(res)
    },

    async getArchiveVersionsByPackageId(packageId) {
        let res = await Axios.get(bimhomeConfig.CdgUrl + `/archive-packages/${packageId}/versions`);
        return ApiUtils_CheckArray(res)
    },
    async postArchiveResources(packageId, body) {
        let res = await Axios.post(bimhomeConfig.CdgUrl + `/archive-packages/${packageId}/resources`, body);
        return res;
    },

    async getPackageVersion(packageId, version) {
        let res = await Axios.get(bimhomeConfig.CdgUrl + `/archive-versions?packageId=${packageId}&version=${version}`);
        return ApiUtils_CheckObj(res)
    }

    // async getPackageVersions(versionIds) {
    //     let res = await Axios.post(bimhomeConfig.CdgUrl + `/search/archive-packages/versions`, versionIds);
    //     return ApiUtils_CheckArray(res)
    // }

}
export { archiveapi };