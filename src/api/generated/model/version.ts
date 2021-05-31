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
 * @interface Version
 */
export interface Version {
    /**
     * 
     * @type {number}
     * @memberof Version
     */
    byteSize?: number;
    /**
     * 
     * @type {number}
     * @memberof Version
     */
    changedElementCount?: number;
    /**
     * 
     * @type {string}
     * @memberof Version
     */
    creationTime?: string;
    /**
     * 
     * @type {string}
     * @memberof Version
     */
    dataSetId?: string;
    /**
     * 
     * @type {string}
     * @memberof Version
     */
    dataSetSourceFile?: string;
    /**
     * 
     * @type {string}
     * @memberof Version
     */
    dataUploadStatus?: string;
    /**
     * 
     * @type {number}
     * @memberof Version
     */
    deletedElementCount?: number;
    /**
     * 
     * @type {string}
     * @memberof Version
     */
    description?: string;
    /**
     * 
     * @type {string}
     * @memberof Version
     */
    displayVersion?: string;
    /**
     * 
     * @type {number}
     * @memberof Version
     */
    elementCount?: number;
    /**
     * 
     * @type {number}
     * @memberof Version
     */
    hbaseByteSize?: number;
    /**
     * 
     * @type {number}
     * @memberof Version
     */
    id?: number;
    /**
     * 
     * @type {number}
     * @memberof Version
     */
    isDelete?: number;
    /**
     * 
     * @type {string}
     * @memberof Version
     */
    metaInfo?: string;
    /**
     * 
     * @type {number}
     * @memberof Version
     */
    mysqlByteSize?: number;
    /**
     * 
     * @type {number}
     * @memberof Version
     */
    obsByteSize?: number;
    /**
     * 
     * @type {string}
     * @memberof Version
     */
    rawData?: string;
    /**
     * 
     * @type {string}
     * @memberof Version
     */
    rawDataFile?: string;
    /**
     * 
     * @type {string}
     * @memberof Version
     */
    refInfo?: string;
    /**
     * 
     * @type {string}
     * @memberof Version
     */
    refInfoFile?: string;
    /**
     * 
     * @type {string}
     * @memberof Version
     */
    status?: string;
    /**
     * 
     * @type {number}
     * @memberof Version
     */
    suiteCount?: number;
    /**
     * 
     * @type {string}
     * @memberof Version
     */
    updateTime?: string;
    /**
     * 
     * @type {string}
     * @memberof Version
     */
    verify?: string;
    /**
     * 
     * @type {string}
     * @memberof Version
     */
    verifyStatus?: VersionVerifyStatusEnum;
    /**
     * 
     * @type {number}
     * @memberof Version
     */
    version?: number;
    /**
     * 
     * @type {string}
     * @memberof Version
     */
    versionStatus?: VersionVersionStatusEnum;
    /**
     * 
     * @type {string}
     * @memberof Version
     */
    viewingInfo?: string;
    /**
     * 
     * @type {string}
     * @memberof Version
     */
    xtoken?: string;
}

/**
    * @export
    * @enum {string}
    */
export enum VersionVerifyStatusEnum {
    Unverified = 'Unverified',
    Legal = 'Legal',
    Illegal = 'illegal'
}
/**
    * @export
    * @enum {string}
    */
export enum VersionVersionStatusEnum {
    CREATING = 'CREATING',
    FAILED = 'FAILED',
    ELEMENTFINISHED = 'ELEMENT_FINISHED',
    FINSHED = 'FINSHED',
    TIMEOUT = 'TIMEOUT',
    CANCEL = 'CANCEL'
}



