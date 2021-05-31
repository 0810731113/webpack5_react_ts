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
 * @interface DataCode
 */
export interface DataCode {
    /**
     * 
     * @type {string}
     * @memberof DataCode
     */
    code?: string;
    /**
     * 
     * @type {string}
     * @memberof DataCode
     */
    description?: string;
    /**
     * 
     * @type {number}
     * @memberof DataCode
     */
    isLeaf?: number;
    /**
     * 
     * @type {string}
     * @memberof DataCode
     */
    mnemonic?: string;
    /**
     * 
     * @type {Array<DataCode>}
     * @memberof DataCode
     */
    subCodes?: Array<DataCode>;
    /**
     * 
     * @type {string}
     * @memberof DataCode
     */
    symbol?: string;
    /**
     * 
     * @type {string}
     * @memberof DataCode
     */
    table?: string;
    /**
     * 
     * @type {string}
     * @memberof DataCode
     */
    title?: string;
    /**
     * 
     * @type {Array<object>}
     * @memberof DataCode
     */
    valueList?: Array<object>;
    /**
     * 
     * @type {string}
     * @memberof DataCode
     */
    valueListStr?: string;
    /**
     * 
     * @type {number}
     * @memberof DataCode
     */
    valueType?: number;
}

