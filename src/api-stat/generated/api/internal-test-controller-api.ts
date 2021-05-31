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
/**
 * InternalTestControllerApi - axios parameter creator
 * @export
 */
export const InternalTestControllerApiAxiosParamCreator = function (configuration?: Configuration) {
    return {
        /**
         * 
         * @summary exception
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        exceptionUsingGET: async (options: any = {}): Promise<RequestArgs> => {
            const localVarPath = `/exception`;
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
         * @summary healthy
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        healthyUsingGET: async (options: any = {}): Promise<RequestArgs> => {
            const localVarPath = `/health`;
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
         * @summary timeout
         * @param {number} timeoutInMill timeoutInMill
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        timeoutUsingGET: async (timeoutInMill: number, options: any = {}): Promise<RequestArgs> => {
            // verify required parameter 'timeoutInMill' is not null or undefined
            if (timeoutInMill === null || timeoutInMill === undefined) {
                throw new RequiredError('timeoutInMill','Required parameter timeoutInMill was null or undefined when calling timeoutUsingGET.');
            }
            const localVarPath = `/timeout/{timeoutInMill}`
                .replace(`{${"timeoutInMill"}}`, encodeURIComponent(String(timeoutInMill)));
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
 * InternalTestControllerApi - functional programming interface
 * @export
 */
export const InternalTestControllerApiFp = function(configuration?: Configuration) {
    return {
        /**
         * 
         * @summary exception
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async exceptionUsingGET(options?: any): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<string>> {
            const localVarAxiosArgs = await InternalTestControllerApiAxiosParamCreator(configuration).exceptionUsingGET(options);
            return (axios: AxiosInstance = globalAxios, basePath: string = BASE_PATH) => {
                const axiosRequestArgs = {...localVarAxiosArgs.options, url: basePath + localVarAxiosArgs.url};
                return axios.request(axiosRequestArgs);
            };
        },
        /**
         * 
         * @summary healthy
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async healthyUsingGET(options?: any): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<string>> {
            const localVarAxiosArgs = await InternalTestControllerApiAxiosParamCreator(configuration).healthyUsingGET(options);
            return (axios: AxiosInstance = globalAxios, basePath: string = BASE_PATH) => {
                const axiosRequestArgs = {...localVarAxiosArgs.options, url: basePath + localVarAxiosArgs.url};
                return axios.request(axiosRequestArgs);
            };
        },
        /**
         * 
         * @summary timeout
         * @param {number} timeoutInMill timeoutInMill
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async timeoutUsingGET(timeoutInMill: number, options?: any): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<number>> {
            const localVarAxiosArgs = await InternalTestControllerApiAxiosParamCreator(configuration).timeoutUsingGET(timeoutInMill, options);
            return (axios: AxiosInstance = globalAxios, basePath: string = BASE_PATH) => {
                const axiosRequestArgs = {...localVarAxiosArgs.options, url: basePath + localVarAxiosArgs.url};
                return axios.request(axiosRequestArgs);
            };
        },
    }
};

/**
 * InternalTestControllerApi - factory interface
 * @export
 */
export const InternalTestControllerApiFactory = function (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) {
    return {
        /**
         * 
         * @summary exception
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        exceptionUsingGET(options?: any): AxiosPromise<string> {
            return InternalTestControllerApiFp(configuration).exceptionUsingGET(options).then((request) => request(axios, basePath));
        },
        /**
         * 
         * @summary healthy
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        healthyUsingGET(options?: any): AxiosPromise<string> {
            return InternalTestControllerApiFp(configuration).healthyUsingGET(options).then((request) => request(axios, basePath));
        },
        /**
         * 
         * @summary timeout
         * @param {number} timeoutInMill timeoutInMill
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        timeoutUsingGET(timeoutInMill: number, options?: any): AxiosPromise<number> {
            return InternalTestControllerApiFp(configuration).timeoutUsingGET(timeoutInMill, options).then((request) => request(axios, basePath));
        },
    };
};

/**
 * InternalTestControllerApi - object-oriented interface
 * @export
 * @class InternalTestControllerApi
 * @extends {BaseAPI}
 */
export class InternalTestControllerApi extends BaseAPI {
    /**
     * 
     * @summary exception
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof InternalTestControllerApi
     */
    public exceptionUsingGET(options?: any) {
        return InternalTestControllerApiFp(this.configuration).exceptionUsingGET(options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * 
     * @summary healthy
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof InternalTestControllerApi
     */
    public healthyUsingGET(options?: any) {
        return InternalTestControllerApiFp(this.configuration).healthyUsingGET(options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * 
     * @summary timeout
     * @param {number} timeoutInMill timeoutInMill
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof InternalTestControllerApi
     */
    public timeoutUsingGET(timeoutInMill: number, options?: any) {
        return InternalTestControllerApiFp(this.configuration).timeoutUsingGET(timeoutInMill, options).then((request) => request(this.axios, this.basePath));
    }

}
