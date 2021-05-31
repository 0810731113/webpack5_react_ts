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


import { VersionVO } from './version-vo';

/**
 * 
 * @export
 * @interface ShareRecordVO
 */
export interface ShareRecordVO {
    /**
     * 
     * @type {string}
     * @memberof ShareRecordVO
     */
    acceptTime?: string;
    /**
     * 
     * @type {string}
     * @memberof ShareRecordVO
     */
    consumeUserId?: string;
    /**
     * 
     * @type {string}
     * @memberof ShareRecordVO
     */
    consumedId?: string;
    /**
     * 
     * @type {Array<VersionVO>}
     * @memberof ShareRecordVO
     */
    contents?: Array<VersionVO>;
    /**
     * 
     * @type {string}
     * @memberof ShareRecordVO
     */
    creationTime?: string;
    /**
     * 
     * @type {string}
     * @memberof ShareRecordVO
     */
    description?: string;
    /**
     * 
     * @type {string}
     * @memberof ShareRecordVO
     */
    id?: string;
    /**
     * 
     * @type {string}
     * @memberof ShareRecordVO
     */
    name?: string;
    /**
     * 
     * @type {string}
     * @memberof ShareRecordVO
     */
    shareId?: string;
    /**
     * 
     * @type {string}
     * @memberof ShareRecordVO
     */
    shareTime?: string;
    /**
     * 
     * @type {string}
     * @memberof ShareRecordVO
     */
    shareUserId?: string;
    /**
     * 
     * @type {string}
     * @memberof ShareRecordVO
     */
    status?: ShareRecordVOStatusEnum;
    /**
     * 
     * @type {string}
     * @memberof ShareRecordVO
     */
    updateTime?: string;
}

/**
    * @export
    * @enum {string}
    */
export enum ShareRecordVOStatusEnum {
    Temporary = 'Temporary',
    Shared = 'Shared',
    Consumed = 'Consumed'
}


