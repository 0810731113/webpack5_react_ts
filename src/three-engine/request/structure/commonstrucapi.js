import bimhomeConfig from '../../config/bimhomeconfig';
// import Axios from 'axios';
import { Axios } from '../apicommon';
import { Utils_findFirstElementTypeInArray, Utils_isArray, ApiUtils_CheckArray, ApiUtils_CheckObj } from '../apiutils';


const commonstrucapi = {

    getCategories() {
        return Axios.get(`${bimhomeConfig.StructureUrl}/structural/common/classify`).then((res) => {
            return ApiUtils_CheckObj(res);
        });
    },


    getSuitesByCategoryId(catId) {
        return Axios.get(`${bimhomeConfig.StructureUrl}/structural/common/classify/${catId}/suites?page=1&pageSize=500`).then((res) => {
            return ApiUtils_CheckObj(res);
        });
    },

    search(keyword) {
        let body = {
            category: 0,
            keyword: keyword,
            page: 1,
            pageSize: 500
        }

        return Axios.post(`${bimhomeConfig.StructureUrl}/structural/common/suites/search`, body).then((res) => {
            return ApiUtils_CheckObj(res);
        });
    },

}

export { commonstrucapi }