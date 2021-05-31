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


import { ElementVersionStandardCodeVO } from './element-version-standard-code-vo';

/**
 * 
 * @export
 * @interface ResponseListElementVersionStandardCodeVO
 */
export interface ResponseListElementVersionStandardCodeVO {
    /**
     * 请求响应码
     * @type {number}
     * @memberof ResponseListElementVersionStandardCodeVO
     */
    code?: number;
    /**
     * 请求响应数据
     * @type {Array<ElementVersionStandardCodeVO>}
     * @memberof ResponseListElementVersionStandardCodeVO
     */
    data?: Array<ElementVersionStandardCodeVO>;
    /**
     * 状态码对应的描述信息
     * @type {string}
     * @memberof ResponseListElementVersionStandardCodeVO
     */
    msg?: string;
}

