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


import { ProjectVO } from './project-vo';

/**
 * 
 * @export
 * @interface ResponseProjectVO
 */
export interface ResponseProjectVO {
    /**
     * 请求响应码
     * @type {number}
     * @memberof ResponseProjectVO
     */
    code?: number;
    /**
     * 
     * @type {ProjectVO}
     * @memberof ResponseProjectVO
     */
    data?: ProjectVO;
    /**
     * 状态码对应的描述信息
     * @type {string}
     * @memberof ResponseProjectVO
     */
    msg?: string;
}

