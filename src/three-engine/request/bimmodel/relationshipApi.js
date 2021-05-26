import bimhomeConfig from '../../config/bimhomeconfig';
//import Axios from 'axios';
import { Axios } from '../apicommon';

const relationshipApi = {

    getRelationships({fromVersionId, relationShipType, toVersionId}) {
        return Axios.get(`${bimhomeConfig.CdgUrl}/relationships?fromVersionId=${fromVersionId}&relationShipType=${relationShipType}&toVersionId=${toVersionId}`);
    },
}

export default relationshipApi;