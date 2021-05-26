import bimhomeConfig from '../../config/bimhomeconfig';
// import Axios from 'axios';
import { Axios } from '../apicommon';
import { Utils_isArray, ApiUtils_CheckArray, Utils_findFirstElementTypeInArray } from '../apiutils';
import { specialtyapi } from './specialtyapi';
import { datasetapi } from './datasetapi';
import { dateFormat } from '@/app/ui/utils/common';


const messageapi = {

    sendMessages(projectId, dsIds) {
        let now = new Date();
        let body = {
            consumerIds: dsIds,
            consumerType: "ArchitectDataset",
            content: `用户在${dateFormat(new Date(), 'yyyy年MM月dd日hh时mm分')}年更新了建筑专业级设置`,
            producerType: "ProjectProfessionConfig",
            producerSourceId: projectId,
        }

        return Axios.put(`${bimhomeConfig.CdgUrl}/messages`, body).then((res) => {
            return res
        })
    },

    doPublish(projectId) {
        return specialtyapi.querySpecialty(projectId).then((arr) => {
            let arcSpecialty = arr.find((ele) => ele.name === '建筑');
            if (arcSpecialty) {
                return arcSpecialty.id;
            } else {
                return Promise.reject('本项目下没查到建筑专业id')
            }
        }).then((specialtyId) => {
            return datasetapi.getDatasetsBySpecialtyId(specialtyId).then((res) => {
                let arr = ApiUtils_CheckArray(res);
                return arr.map((ds) => ds.id)
            })
        }).then((dsIds) => {
            if (dsIds instanceof Array && dsIds.length > 0) {
                return this.sendMessages(projectId, dsIds);
            } else {
                return Promise.resolve('无建筑团队工作单元')
            }
        })
    }
}

export { messageapi }