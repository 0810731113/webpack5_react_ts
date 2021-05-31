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


import { StandardCodeVO } from './standard-code-vo';

/**
 * 
 * @export
 * @interface ResponseListStandardCodeVO
 */
export interface ResponseListStandardCodeVO {
    /**
     * 请求响应码
     * @type {number}
     * @memberof ResponseListStandardCodeVO
     */
    code?: number;
    /**
     * 请求响应数据
     * @type {Array<StandardCodeVO>}
     * @memberof ResponseListStandardCodeVO
     */
    data?: Array<StandardCodeVO>;
    /**
     * 状态码对应的描述信息
     * @type {string}
     * @memberof ResponseListStandardCodeVO
     */
    msg?: string;
}

