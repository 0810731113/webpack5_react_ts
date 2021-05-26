import bimhomeConfig from '../../config/bimhomeconfig';
// import Axios from 'axios';
import { Axios } from '../apicommon';

import { Utils_findFirstElementTypeInArray, ApiUtils_CheckArray, ApiUtils_CheckObj } from '../apiutils';
import { getBfElementId } from '../../app/ui/utils/common';
import { datasetapi } from './datasetapi';

const elementapi = {

    getIncrementsByVersions(dsId, endVersion, version) {
        let url = `${bimhomeConfig.CdgUrl}/elements/increment?datasetId=${dsId}&endVersion=${endVersion}&version=${version}`
        return Axios.get(url).then((res) => {
            return ApiUtils_CheckArray(res)
        });
    },

    //3f0b0eb5-3402-483d-90d5-45a1deaa39fb
    //1,2

    getElementsByDsVersion(dsId, version) {
        let url = `${bimhomeConfig.CdgUrl}/elements?dsId=${dsId}&version=${version}`
        return Axios.get(url).then((res) => {
            return ApiUtils_CheckArray(res)
            //return ApiUtils_CheckArray(res).filter((xx)=> xx.typeMeta==='Instance')
        });
    },

    getCompareContent(dsId, endVersion, version) {
        let url = `${bimhomeConfig.CdgUrl}/instances/increment?datasetId=${dsId}&endVersion=${endVersion}&version=${version}`
        return Axios.get(url).then((res) => {

            return ApiUtils_CheckObj(res)
        });
    },

    getIncrementElements(dsId, endVersion, version) {
        let url = `${bimhomeConfig.CdgUrl}/elements/increment?datasetId=${dsId}&endVersion=${endVersion}&version=${version}`
        return Axios.get(url).then((res) => {

            return ApiUtils_CheckObj(res)
        });
    }
}

const getIncrementElement = function (dsId, endVersion, startVersion) {
    if (dsId && endVersion && startVersion) {

        let p1 = elementapi.getIncrementElements(dsId, endVersion, startVersion);
        let p2 = elementapi.getElementsByDsVersion(dsId, startVersion);
        let p3 = datasetapi.getDsSubId(dsId);

        return Promise.all([p1, p2, p3]).then((res) => {
            let incrementElements = res[0];
            let preVersionElements = res[1];
            let subId = res[2]

            let differenceMap = handleIncrementElement(incrementElements, preVersionElements, subId);
            let incrementData = {
                Added: [],
                Modified: [],
                Deleted: []
            }
            differenceMap.forEach(function (value, key) {
                switch (key) {
                    case incrementType.ADDED:
                        incrementData.Added.push(...value)
                        break;
                    case incrementType.DELETED:
                        incrementData.Deleted.push(...value)
                        break;
                    case incrementType.MODIFIED:
                        incrementData.Modified.push(...value)
                        break;
                }
            });
            return incrementData;
        })

    }
}

const handleIncrementElement = (incrementElements, preVersionElements, subId) => {
    var preElements = new Map();
    preVersionElements.forEach((preVersionElement) => {
        if (preVersionElement.typeMeta === 'Instance' && preVersionElement.mesh != '[]') {
            preElements.set(preVersionElement.id, preVersionElement);
        }
    });
    //按照增量类型(增加的，修改的，删除的)存放增量构件
    var differenceMap = new Map();
    differenceMap.set(incrementType.ADDED, new Array());
    differenceMap.set(incrementType.MODIFIED, new Array());
    differenceMap.set(incrementType.DELETED, new Array());

    incrementElements.forEach((incrementElement) => {
        var element = preElements.get(incrementElement.id);
        if (incrementElement.typeMeta === 'Instance' && incrementElement.mesh != '[]') {
            var type = (element == null ? incrementType.ADDED : incrementType.MODIFIED);
            incrementElement.name = incrementElement.name == null ? '未命名' : incrementElement.name;

            incrementElement.bfId = getBfElementId(subId, incrementElement.id);
            differenceMap.get(type).push(incrementElement);
        } else if (element != null && incrementElement.deleted) {
            element.name = element.name == null ? '未命名' : element.name;

            element.bfId = getBfElementId(subId, element.id);
            differenceMap.get(incrementType.DELETED).push(element);
        }
    })

    return differenceMap;
}

const incrementType = {
    ADDED: 'ADDED',
    MODIFIED: 'MODIFIED',
    DELETED: 'DELETED'
}

export { elementapi, getIncrementElement }