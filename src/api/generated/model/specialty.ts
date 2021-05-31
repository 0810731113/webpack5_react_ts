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
 * @interface Specialty
 */
export interface Specialty {
    /**
     * 
     * @type {string}
     * @memberof Specialty
     */
    description?: string;
    /**
     * 
     * @type {string}
     * @memberof Specialty
     */
    id?: string;
    /**
     * 
     * @type {string}
     * @memberof Specialty
     */
    name?: string;
    /**
     * 
     * @type {string}
     * @memberof Specialty
     */
    projectId?: string;
    /**
     * 
     * @type {string}
     * @memberof Specialty
     */
    type?: SpecialtyTypeEnum;
}

/**
    * @export
    * @enum {string}
    */
export enum SpecialtyTypeEnum {
    Unknown = 'Unknown',
    GAP = 'GAP',
    GST = 'GST',
    GMEP = 'GMEP'
}


