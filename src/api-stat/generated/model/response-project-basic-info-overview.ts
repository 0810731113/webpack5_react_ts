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


import { ProjectBasicInfoOverview } from './project-basic-info-overview';

/**
 * 
 * @export
 * @interface ResponseProjectBasicInfoOverview
 */
export interface ResponseProjectBasicInfoOverview {
    /**
     * 请求响应码
     * @type {number}
     * @memberof ResponseProjectBasicInfoOverview
     */
    code?: number;
    /**
     * 
     * @type {ProjectBasicInfoOverview}
     * @memberof ResponseProjectBasicInfoOverview
     */
    data?: ProjectBasicInfoOverview;
    /**
     * 状态码对应的描述信息
     * @type {string}
     * @memberof ResponseProjectBasicInfoOverview
     */
    msg?: string;
}


