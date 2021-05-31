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


import { TaskVO } from './task-vo';

/**
 * 
 * @export
 * @interface PageResponseTaskVO
 */
export interface PageResponseTaskVO {
    /**
     * 
     * @type {Array<TaskVO>}
     * @memberof PageResponseTaskVO
     */
    items?: Array<TaskVO>;
    /**
     * 总页数
     * @type {number}
     * @memberof PageResponseTaskVO
     */
    pageCount?: number;
    /**
     * 当前页
     * @type {number}
     * @memberof PageResponseTaskVO
     */
    pageIndex?: number;
    /**
     * 每页大小
     * @type {number}
     * @memberof PageResponseTaskVO
     */
    pageSize?: number;
    /**
     * 总记录数
     * @type {number}
     * @memberof PageResponseTaskVO
     */
    total?: number;
}

