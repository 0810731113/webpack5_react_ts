import axios from 'axios';
import bimhomeConfig from '../../config/bimhomeconfig';

const baseUrl = bimhomeConfig.CdgUrl;

const gdcDbConnector = {
    getFolderByProject: (params) => axios({
        method: 'get',
        baseURL: baseUrl,
        url: '/folder/byproject',
        params: params,
        responseType: 'json',
        responseEncoding: 'utf8',
    }),

    getModelElements: (params) => axios({
        method: 'get',
        baseURL: baseUrl,
        url: '/elements',
        params: params,
        responseType: 'json',
        responseEncoding: 'utf8',
    }),

    getLatestVersion: (params) => axios({
        method: 'get',
        baseURL: baseUrl,
        url: '/model/' + params.modelId + '/version/latest',
        responseType: 'json',
        responseEncoding: 'utf8',
    }),

    getModelsByFolder: (params) => axios({
        method: 'get',
        baseURL: baseUrl,
        url: '/model/byfolder',
        params: params,
        responseType: 'json',
        responseEncoding: 'utf8',
    }),

    getSASForRead: (data) => axios({
        method: 'post',
        baseURL: baseUrl,
        url: '/file/read',
        responseType: 'json',
        responseEncoding: 'utf8',
        data: data
    }),
}

export { gdcDbConnector }