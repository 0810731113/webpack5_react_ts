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


import { BimfaceUpdate } from './bimface-update';

/**
 * 
 * @export
 * @interface ResponseListBimfaceUpdate
 */
export interface ResponseListBimfaceUpdate {
    /**
     * 请求响应码
     * @type {number}
     * @memberof ResponseListBimfaceUpdate
     */
    code?: number;
    /**
     * 请求响应数据
     * @type {Array<BimfaceUpdate>}
     * @memberof ResponseListBimfaceUpdate
     */
    data?: Array<BimfaceUpdate>;
    /**
     * 状态码对应的描述信息
     * @type {string}
     * @memberof ResponseListBimfaceUpdate
     */
    msg?: string;
}

