import bimhomeConfig from '../../config/bimhomeconfig';
// import Axios from 'axios';
import { Axios } from '../apicommon';

const workerapi = {

    startWorkder(versionId, type) {
        let data = {
            versionId: versionId,
            toType: type
        }
        return Axios.post(bimhomeConfig.Bfproxy + '/v1/upload/', data);
    },

    searchProcess(processId) {
        return Axios.get(bimhomeConfig.Bfproxy + '/v1/upload/' + processId);
    }
}

export { workerapi }