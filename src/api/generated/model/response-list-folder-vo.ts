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


import { FolderVO } from './folder-vo';

/**
 * 
 * @export
 * @interface ResponseListFolderVO
 */
export interface ResponseListFolderVO {
    /**
     * 请求响应码
     * @type {number}
     * @memberof ResponseListFolderVO
     */
    code?: number;
    /**
     * 请求响应数据
     * @type {Array<FolderVO>}
     * @memberof ResponseListFolderVO
     */
    data?: Array<FolderVO>;
    /**
     * 状态码对应的描述信息
     * @type {string}
     * @memberof ResponseListFolderVO
     */
    msg?: string;
}

