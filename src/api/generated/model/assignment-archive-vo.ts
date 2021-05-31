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
 * @interface AssignmentArchiveVO
 */
export interface AssignmentArchiveVO {
    /**
     * 
     * @type {number}
     * @memberof AssignmentArchiveVO
     */
    archiveAssignmentId?: number;
    /**
     * 
     * @type {string}
     * @memberof AssignmentArchiveVO
     */
    createTime?: string;
    /**
     * 
     * @type {string}
     * @memberof AssignmentArchiveVO
     */
    packageId?: string;
    /**
     * 
     * @type {string}
     * @memberof AssignmentArchiveVO
     */
    recipient?: string;
    /**
     * 
     * @type {string}
     * @memberof AssignmentArchiveVO
     */
    sharer?: string;
    /**
     * 
     * @type {string}
     * @memberof AssignmentArchiveVO
     */
    status?: AssignmentArchiveVOStatusEnum;
    /**
     * 
     * @type {number}
     * @memberof AssignmentArchiveVO
     */
    version?: number;
}

/**
    * @export
    * @enum {string}
    */
export enum AssignmentArchiveVOStatusEnum {
    Enable = 'enable',
    Disabled = 'disabled',
    Notfound = 'notfound'
}


