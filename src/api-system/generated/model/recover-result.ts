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
 * @interface RecoverResult
 */
export interface RecoverResult {
    /**
     * 
     * @type {Array<string>}
     * @memberof RecoverResult
     */
    failedTables?: Array<string>;
    /**
     * 
     * @type {string}
     * @memberof RecoverResult
     */
    snapshotId?: string;
    /**
     * 
     * @type {Array<string>}
     * @memberof RecoverResult
     */
    successTables?: Array<string>;
}

