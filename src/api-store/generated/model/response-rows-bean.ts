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


import { RowsBean } from './rows-bean';

/**
 * 
 * @export
 * @interface ResponseRowsBean
 */
export interface ResponseRowsBean {
    /**
     * 请求响应码
     * @type {number}
     * @memberof ResponseRowsBean
     */
    code?: number;
    /**
     * 
     * @type {RowsBean}
     * @memberof ResponseRowsBean
     */
    data?: RowsBean;
    /**
     * 状态码对应的描述信息
     * @type {string}
     * @memberof ResponseRowsBean
     */
    msg?: string;
}

