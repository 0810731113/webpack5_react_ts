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


import { IncrementElement } from './increment-element';

/**
 * 
 * @export
 * @interface ResponseMapstringListIncrementElement
 */
export interface ResponseMapstringListIncrementElement {
    /**
     * 请求响应码
     * @type {number}
     * @memberof ResponseMapstringListIncrementElement
     */
    code?: number;
    /**
     * 请求响应数据
     * @type {{ [key: string]: Array<IncrementElement>; }}
     * @memberof ResponseMapstringListIncrementElement
     */
    data?: { [key: string]: Array<IncrementElement>; };
    /**
     * 状态码对应的描述信息
     * @type {string}
     * @memberof ResponseMapstringListIncrementElement
     */
    msg?: string;
}

