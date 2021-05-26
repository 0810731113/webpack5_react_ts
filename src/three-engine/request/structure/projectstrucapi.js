import bimhomeConfig from '../../config/bimhomeconfig';
// import Axios from 'axios';
import { Axios } from '../apicommon';
import { Utils_findFirstElementTypeInArray, Utils_isArray, ApiUtils_CheckArray, ApiUtils_CheckObj } from '../apiutils';


const projectstrucapi = {

    getCategories(projectId) {

        let body = {
            categoryIds: [],
            keyword: ''
        }

        return Axios.post(`${bimhomeConfig.StructureUrl}/structural/project/${projectId}/suite/category`, body).then((res) => {
            return ApiUtils_CheckObj(res);
        });
    },

    getSuitesByCategoryId(catId, projectId) {
        let body = {
            category: catId,
            keyword: '',
            projectId: projectId,
            page: 1,
            pageSize: 500
        }

        return Axios.post(`${bimhomeConfig.StructureUrl}/structural/project/suites/search`, body).then((res) => {
            return ApiUtils_CheckObj(res);
        });
    },

    searchKeyword(keyword, projectId) {
        let body = {
            category: 0,
            keyword: keyword,
            projectId: projectId,
            page: 1,
            pageSize: 500
        }

        return Axios.post(`${bimhomeConfig.StructureUrl}/structural/project/suites/search`, body).then((res) => {
            return ApiUtils_CheckObj(res);
        });
    },


    addSuiteToProject(suiteId, projectId) {
        let body = {
            projectId: projectId,
            suites: [suiteId]
        }
        return Axios.post(`${bimhomeConfig.StructureUrl}/structural/project/suites`, body).then((res) => {
            return res;
        });

    },

    // checkSuiteExistInProject(suiteId, projectId) {
    //     let body = [suiteId];

    //     return Axios.post(`${bimhomeConfig.StructureUrl}/structural/project/${projectId}/suite/ids`, body).then((res) => {
    //         return ApiUtils_CheckObj(res);
    //     });
    // },

    checkSuiteExistInProject(suiteId, projectId) {

        return Axios.post(`${bimhomeConfig.StructureUrl}/structural/project/${projectId}/suite/${suiteId}`).then((res) => {
            return ApiUtils_CheckObj(res);
        });
    }
}

export { projectstrucapi }