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


import { ArchivePackageVO } from './archive-package-vo';

/**
 * 
 * @export
 * @interface ResponseArchivePackageVO
 */
export interface ResponseArchivePackageVO {
    /**
     * 请求响应码
     * @type {number}
     * @memberof ResponseArchivePackageVO
     */
    code?: number;
    /**
     * 
     * @type {ArchivePackageVO}
     * @memberof ResponseArchivePackageVO
     */
    data?: ArchivePackageVO;
    /**
     * 状态码对应的描述信息
     * @type {string}
     * @memberof ResponseArchivePackageVO
     */
    msg?: string;
}

