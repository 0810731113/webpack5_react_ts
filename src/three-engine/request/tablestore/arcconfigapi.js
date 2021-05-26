import bimhomeConfig from '../../config/bimhomeconfig';
// import Axios from 'axios';
import { Axios } from '../apicommon';
import { uuid } from '../../app/ui/utils/common';
import { ApiUtils_CheckObj } from '../apiutils';


const arcconfigapi = {
    namespace: 'architecture',
    tablename: 'arcconfig',
    owner: '8qHMWt6w1044A4TJT7vDVJZiYTtiHFni',

    saveConfig(obj, projectId, version) {

        let body = {
            owner: this.owner,
            rows: [
                {
                    partition: projectId,
                    fields: [
                        {
                            name: 'levelConfig',
                            type: 0,
                            value: JSON.stringify(obj)
                        },
                        {
                            name: 'projectId',
                            type: 0,
                            value: projectId
                        },
                        {
                            name: 'version',
                            type: 1,
                            value: version
                        }
                    ],
                }
            ]
        }


        return Axios.post(`${bimhomeConfig.StoreUrl}/thirdtable/table/${this.namespace}/${this.tablename}/row`, body)
    },

    getConfig(projectId) {

        let body = {

            fields: [],
            filterConditionList: {
                condition: 'MUST_PASS_ALL',
                fieldFilters: [
                    {
                        compareOp: 'EQUAL',
                        field: {
                            name: "projectId",
                            value: projectId,
                        }
                    }
                ]
            },
            owner: this.owner,
            partition: projectId

        }

        return Axios.post(`${bimhomeConfig.StoreUrl}/thirdtable/table/${this.namespace}/${this.tablename}/data`, body).then((res) => {
            let rtObj = ApiUtils_CheckObj(res)

            if (rtObj.rows instanceof Array && rtObj.rows.length > 0) {
                let arr = rtObj.rows.filter((ele) => ele.version ? true : false);

                let latestRecord;
                if (arr && arr.length > 0) {
                    latestRecord = arr.sort((a, b) => b.version - a.version)[0];
                }

                return latestRecord;

            } else {
                return null
            }
        })
    }

}

export { arcconfigapi }