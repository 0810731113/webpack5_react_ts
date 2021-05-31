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



/**
 * 
 * @export
 * @interface ResponseMapstringMapstringListstring
 */
export interface ResponseMapstringMapstringListstring {
    /**
     * 请求响应码
     * @type {number}
     * @memberof ResponseMapstringMapstringListstring
     */
    code?: number;
    /**
     * 请求响应数据
     * @type {{ [key: string]: { [key: string]: Array<string>; }; }}
     * @memberof ResponseMapstringMapstringListstring
     */
    data?: { [key: string]: { [key: string]: Array<string>; }; };
    /**
     * 状态码对应的描述信息
     * @type {string}
     * @memberof ResponseMapstringMapstringListstring
     */
    msg?: string;
}


