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


import { EnhanceBimConfigVO } from './enhance-bim-config-vo';

/**
 * 
 * @export
 * @interface ResponseEnhanceBimConfigVO
 */
export interface ResponseEnhanceBimConfigVO {
    /**
     * 请求响应码
     * @type {number}
     * @memberof ResponseEnhanceBimConfigVO
     */
    code?: number;
    /**
     * 
     * @type {EnhanceBimConfigVO}
     * @memberof ResponseEnhanceBimConfigVO
     */
    data?: EnhanceBimConfigVO;
    /**
     * 状态码对应的描述信息
     * @type {string}
     * @memberof ResponseEnhanceBimConfigVO
     */
    msg?: string;
}


