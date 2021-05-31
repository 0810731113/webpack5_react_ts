// tslint:disable
/**
 * Api Documentation
 * Api Documentation
 *
 * The version of the OpenAPI document: 1.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


import * as globalImportUrl from 'url';
import globalAxios, { AxiosPromise, AxiosInstance } from 'axios';
import { Configuration } from '../configuration';
// Some imports not used depending on template conditions
// @ts-ignore
import { BASE_PATH, COLLECTION_FORMATS, RequestArgs, BaseAPI, RequiredError } from '../base';
// @ts-ignore
import { ResponseListElemFilterVO } from '../model';
// @ts-ignore
import { ResponseListFilterCategoryVO } from '../model';
/**
 * ElementFilterApiApi - axios parameter creator
 * @export
 */
export const ElementFilterApiApiAxiosParamCreator = function (configuration?: Configuration) {
    return {
        /**
         * 
         * @summary 获取所有的筛选分类
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getAllElemFiltersUsingGET: async (options: any = {}): Promise<RequestArgs> => {
            const localVarPath = `/element/filters`;
            const localVarUrlObj = globalImportUrl.parse(localVarPath, true);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = { method: 'GET', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;


    
            localVarUrlObj.query = {...localVarUrlObj.query, ...localVarQueryParameter, ...options.query};
            // fix override query string Detail: https://stackoverflow.com/a/7517673/1077943
            delete localVarUrlObj.search;
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: globalImportUrl.format(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * 
         * @summary 获取所有的筛选大类
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getAllFilterCategoriesUsingGET: async (options: any = {}): Promise<RequestArgs> => {
            const localVarPath = `/element/filters/categories`;
            const localVarUrlObj = globalImportUrl.parse(localVarPath, true);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = { method: 'GET', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;


    
            localVarUrlObj.query = {...localVarUrlObj.query, ...localVarQueryParameter, ...options.query};
            // fix override query string Detail: https://stackoverflow.com/a/7517673/1077943
            delete localVarUrlObj.search;
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: globalImportUrl.format(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * 
         * @summary 获取所有的筛选分类
         * @param {number} categoryId categoryId
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getElemFiltersByCategoryUsingGET: async (categoryId: number, options: any = {}): Promise<RequestArgs> => {
            // verify required parameter 'categoryId' is not null or undefined
            if (categoryId === null || categoryId === undefined) {
                throw new RequiredError('categoryId','Required parameter categoryId was null or undefined when calling getElemFiltersByCategoryUsingGET.');
            }
            const localVarPath = `/element/filters/{categoryId}/bycategory`
                .replace(`{${"categoryId"}}`, encodeURIComponent(String(categoryId)));
            const localVarUrlObj = globalImportUrl.parse(localVarPath, true);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = { method: 'GET', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;


    
            localVarUrlObj.query = {...localVarUrlObj.query, ...localVarQueryParameter, ...options.query};
            // fix override query string Detail: https://stackoverflow.com/a/7517673/1077943
            delete localVarUrlObj.search;
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: globalImportUrl.format(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
    }
};

/**
 * ElementFilterApiApi - functional programming interface
 * @export
 */
export const ElementFilterApiApiFp = function(configuration?: Configuration) {
    return {
        /**
         * 
         * @summary 获取所有的筛选分类
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async getAllElemFiltersUsingGET(options?: any): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<ResponseListElemFilterVO>> {
            const localVarAxiosArgs = await ElementFilterApiApiAxiosParamCreator(configuration).getAllElemFiltersUsingGET(options);
            return (axios: AxiosInstance = globalAxios, basePath: string = BASE_PATH) => {
                const axiosRequestArgs = {...localVarAxiosArgs.options, url: basePath + localVarAxiosArgs.url};
                return axios.request(axiosRequestArgs);
            };
        },
        /**
         * 
         * @summary 获取所有的筛选大类
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async getAllFilterCategoriesUsingGET(options?: any): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<ResponseListFilterCategoryVO>> {
            const localVarAxiosArgs = await ElementFilterApiApiAxiosParamCreator(configuration).getAllFilterCategoriesUsingGET(options);
            return (axios: AxiosInstance = globalAxios, basePath: string = BASE_PATH) => {
                const axiosRequestArgs = {...localVarAxiosArgs.options, url: basePath + localVarAxiosArgs.url};
                return axios.request(axiosRequestArgs);
            };
        },
        /**
         * 
         * @summary 获取所有的筛选分类
         * @param {number} categoryId categoryId
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async getElemFiltersByCategoryUsingGET(categoryId: number, options?: any): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<ResponseListElemFilterVO>> {
            const localVarAxiosArgs = await ElementFilterApiApiAxiosParamCreator(configuration).getElemFiltersByCategoryUsingGET(categoryId, options);
            return (axios: AxiosInstance = globalAxios, basePath: string = BASE_PATH) => {
                const axiosRequestArgs = {...localVarAxiosArgs.options, url: basePath + localVarAxiosArgs.url};
                return axios.request(axiosRequestArgs);
            };
        },
    }
};

/**
 * ElementFilterApiApi - factory interface
 * @export
 */
export const ElementFilterApiApiFactory = function (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) {
    return {
        /**
         * 
         * @summary 获取所有的筛选分类
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getAllElemFiltersUsingGET(options?: any): AxiosPromise<ResponseListElemFilterVO> {
            return ElementFilterApiApiFp(configuration).getAllElemFiltersUsingGET(options).then((request) => request(axios, basePath));
        },
        /**
         * 
         * @summary 获取所有的筛选大类
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getAllFilterCategoriesUsingGET(options?: any): AxiosPromise<ResponseListFilterCategoryVO> {
            return ElementFilterApiApiFp(configuration).getAllFilterCategoriesUsingGET(options).then((request) => request(axios, basePath));
        },
        /**
         * 
         * @summary 获取所有的筛选分类
         * @param {number} categoryId categoryId
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getElemFiltersByCategoryUsingGET(categoryId: number, options?: any): AxiosPromise<ResponseListElemFilterVO> {
            return ElementFilterApiApiFp(configuration).getElemFiltersByCategoryUsingGET(categoryId, options).then((request) => request(axios, basePath));
        },
    };
};

/**
 * ElementFilterApiApi - object-oriented interface
 * @export
 * @class ElementFilterApiApi
 * @extends {BaseAPI}
 */
export class ElementFilterApiApi extends BaseAPI {
    /**
     * 
     * @summary 获取所有的筛选分类
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ElementFilterApiApi
     */
    public getAllElemFiltersUsingGET(options?: any) {
        return ElementFilterApiApiFp(this.configuration).getAllElemFiltersUsingGET(options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * 
     * @summary 获取所有的筛选大类
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ElementFilterApiApi
     */
    public getAllFilterCategoriesUsingGET(options?: any) {
        return ElementFilterApiApiFp(this.configuration).getAllFilterCategoriesUsingGET(options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * 
     * @summary 获取所有的筛选分类
     * @param {number} categoryId categoryId
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ElementFilterApiApi
     */
    public getElemFiltersByCategoryUsingGET(categoryId: number, options?: any) {
        return ElementFilterApiApiFp(this.configuration).getElemFiltersByCategoryUsingGET(categoryId, options).then((request) => request(this.axios, this.basePath));
    }

}