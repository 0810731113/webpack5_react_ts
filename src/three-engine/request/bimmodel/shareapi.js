import bimhomeConfig from '../../config/bimhomeconfig';
// import Axios from 'axios';
import { Axios } from '../apicommon';
import { Utils_isArray, ApiUtils_CheckArray } from '../apiutils';
import { teamapi } from './teamapi';

const ShareStatus = {
    Temporary: 'Temporary',
    Shared: 'Shared',
    Consumed: 'Consumed'
}

const shareapi = {

    create(body) {
        return Axios.put(`${bimhomeConfig.CdgUrl}/share`, body);
    },

    createShare({name, versions, description, shareId, selectedPjId}) {
        return teamapi.findAllOtherTeamIds(shareId, selectedPjId).then((consumedIds) => {
            if (consumedIds.length > 0) {
                return this.create({name, versions, shareId, description, consumedIds})
            } else {
                return Promise.reject('此项目就一个团队，无法进行分享！！')
            }

        })
    },
    doShare(body) {
        return Axios.put(`${bimhomeConfig.CdgUrl}/share/records/share`, body);
    },

    acceptShare(shareId) {
        return Axios.post(`${bimhomeConfig.CdgUrl}/share/accept/${shareId}`);
    },
    querySharePackages(teamId, status) {
        return Axios.get(`${bimhomeConfig.CdgUrl}/teams/${teamId}/sharePackages?status=${status || ''}`);
    },

    filterShareRecords(shareId) {
        let body = {
            id: shareId
        }
        return Axios.post(`${bimhomeConfig.CdgUrl}/share/records`, body).then((arr) => {
            return ApiUtils_CheckArray(arr)
        });
    },

    searchShareRecords(shareId, consumeId, status) {
        let body = {
            shareId: shareId,
            consumedId: consumeId,
            status: status
        }

        return Axios.post(`${bimhomeConfig.CdgUrl}/share/records`, body).then((res) => {
            return ApiUtils_CheckArray(res)
        });
    },

    updateShareRecords(body) {
        return Axios.put(`${bimhomeConfig.CdgUrl}/share/records`, body);
    },

    searchShareContent(ids) {
        return Axios.post(`${bimhomeConfig.CdgUrl}/share/contents`, ids).then((res) => {
            let arr = ApiUtils_CheckArray(res);
            if (Utils_isArray(arr)) {
                return this.formatData(arr)
            } else {
                return []
            }
        })

    },
    formatData(arr) {
        let newData = [];

        arr.forEach((ele) => {
            let tmp = {
                id: ele.dataSet.id,
                name: ele.dataSet.name,
                type: ele.dataSet.type,
                versions: ele.versions
            }
            newData.push(tmp)
        })
        return newData
    }

}

export { ShareStatus, shareapi }