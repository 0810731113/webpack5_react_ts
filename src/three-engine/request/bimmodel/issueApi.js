import bimhomeConfig from '../../config/bimhomeconfig';
import { Axios } from '../apicommon';

const issueApi = {

    async createIssue(body) {
        return await Axios.put(bimhomeConfig.CdgUrl + '/issue', body);
    },
    async getIssuesByDsIds(body) {
        return await Axios.post(bimhomeConfig.CdgUrl + '/issue/bydatasetids', body);
    },
    async getIssuesByTeamId(teamId, skipCloudify = true) {
        return await Axios.get(bimhomeConfig.CdgUrl + `/issue/${teamId}/byteamid?skipCloudify=${skipCloudify}`);
    },
    async getIssueDetail(issueId) {
        return await Axios.get(bimhomeConfig.CdgUrl + `/issue/${issueId}/detail`);
    },
    async solveIssue(body) {
        return await Axios.post(bimhomeConfig.CdgUrl + `/issue/solve`, body);
    },
    async closeIssue(body) {
        return await Axios.post(bimhomeConfig.CdgUrl + `/issue/close`, body);
    },
}
export default issueApi;