import bimhomeConfig from '../../config/bimhomeconfig';
// import Axios from 'axios';
import { Axios } from '../apicommon';
import { ApiUtils_CheckArray } from '../apiutils';

const versionapi = {


    async getBatchVersions(verIdArr) {
        let res = await Axios.post(`${bimhomeConfig.CdgUrl}/versions/ids/batch`, verIdArr);
        return ApiUtils_CheckArray(res);
    },

    async getBatchDatasets(dsIdArr) {
        let res = await Axios.post(bimhomeConfig.CdgUrl + '/dataSets/ids/batch', dsIdArr);
        return ApiUtils_CheckArray(res);
    }
}

export { versionapi }