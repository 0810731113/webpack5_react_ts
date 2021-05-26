import bimhomeConfig from '../../config/bimhomeconfig';
// import Axios from 'axios';
import { Axios } from '../apicommon';

const bftokenapi = {

    accessToken: null,

    //defaultFileId: '1810822328788800', //dev
    defaultFileId: '1873752950827104', //QA

    getViewToken(fileId) {
        return Axios.get(bimhomeConfig.Bfproxy + '/view/token?fileId=' + fileId);
    },

    getModelTree(fileId){
        return Axios.get(bimhomeConfig.Bfproxy + '/modelTree/' + fileId);
    }
}

export default bftokenapi