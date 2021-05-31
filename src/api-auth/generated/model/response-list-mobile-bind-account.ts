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


import { MobileBindAccount } from './mobile-bind-account';

/**
 * 
 * @export
 * @interface ResponseListMobileBindAccount
 */
export interface ResponseListMobileBindAccount {
    /**
     * 请求响应码
     * @type {number}
     * @memberof ResponseListMobileBindAccount
     */
    code?: number;
    /**
     * 请求响应数据
     * @type {Array<MobileBindAccount>}
     * @memberof ResponseListMobileBindAccount
     */
    data?: Array<MobileBindAccount>;
    /**
     * 状态码对应的描述信息
     * @type {string}
     * @memberof ResponseListMobileBindAccount
     */
    msg?: string;
}

