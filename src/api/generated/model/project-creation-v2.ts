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


import { StandardPropertyDTO } from './standard-property-dto';

/**
 * 
 * @export
 * @interface ProjectCreationV2
 */
export interface ProjectCreationV2 {
    /**
     * 
     * @type {string}
     * @memberof ProjectCreationV2
     */
    buildingEnterprise?: string;
    /**
     * 
     * @type {string}
     * @memberof ProjectCreationV2
     */
    buildingType?: string;
    /**
     * 
     * @type {string}
     * @memberof ProjectCreationV2
     */
    description?: string;
    /**
     * 
     * @type {string}
     * @memberof ProjectCreationV2
     */
    designEnterprise?: string;
    /**
     * 
     * @type {string}
     * @memberof ProjectCreationV2
     */
    id?: string;
    /**
     * 
     * @type {string}
     * @memberof ProjectCreationV2
     */
    name?: string;
    /**
     * 
     * @type {Array<StandardPropertyDTO>}
     * @memberof ProjectCreationV2
     */
    standardProperties?: Array<StandardPropertyDTO>;
    /**
     * 
     * @type {string}
     * @memberof ProjectCreationV2
     */
    status?: ProjectCreationV2StatusEnum;
    /**
     * 
     * @type {string}
     * @memberof ProjectCreationV2
     */
    structureType?: string;
    /**
     * 
     * @type {string}
     * @memberof ProjectCreationV2
     */
    templateId?: string;
    /**
     * 
     * @type {string}
     * @memberof ProjectCreationV2
     */
    thumbnail?: string;
}

/**
    * @export
    * @enum {string}
    */
export enum ProjectCreationV2StatusEnum {
    Ongoing = 'Ongoing',
    Suspended = 'Suspended',
    Completed = 'Completed'
}


