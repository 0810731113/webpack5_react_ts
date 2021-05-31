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


import { CurrentSystemStatus } from './current-system-status';

/**
 * 
 * @export
 * @interface ResponseCurrentSystemStatus
 */
export interface ResponseCurrentSystemStatus {
    /**
     * 请求响应码
     * @type {number}
     * @memberof ResponseCurrentSystemStatus
     */
    code?: number;
    /**
     * 
     * @type {CurrentSystemStatus}
     * @memberof ResponseCurrentSystemStatus
     */
    data?: CurrentSystemStatus;
    /**
     * 状态码对应的描述信息
     * @type {string}
     * @memberof ResponseCurrentSystemStatus
     */
    msg?: string;
}

