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


import { ProjectStructureVO } from './project-structure-vo';

/**
 * 
 * @export
 * @interface ResponseListProjectStructureVO
 */
export interface ResponseListProjectStructureVO {
    /**
     * 请求响应码
     * @type {number}
     * @memberof ResponseListProjectStructureVO
     */
    code?: number;
    /**
     * 请求响应数据
     * @type {Array<ProjectStructureVO>}
     * @memberof ResponseListProjectStructureVO
     */
    data?: Array<ProjectStructureVO>;
    /**
     * 状态码对应的描述信息
     * @type {string}
     * @memberof ResponseListProjectStructureVO
     */
    msg?: string;
}

