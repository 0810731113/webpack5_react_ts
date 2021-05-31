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
 * @interface BimConfig
 */
export interface BimConfig {
    /**
     * 
     * @type {string}
     * @memberof BimConfig
     */
    configType?: BimConfigConfigTypeEnum;
    /**
     * 
     * @type {string}
     * @memberof BimConfig
     */
    configValue?: string;
    /**
     * 
     * @type {string}
     * @memberof BimConfig
     */
    creationTime?: string;
    /**
     * 
     * @type {number}
     * @memberof BimConfig
     */
    id?: number;
    /**
     * 
     * @type {string}
     * @memberof BimConfig
     */
    scope?: BimConfigScopeEnum;
    /**
     * 
     * @type {string}
     * @memberof BimConfig
     */
    scopeEntityId?: string;
    /**
     * 
     * @type {number}
     * @memberof BimConfig
     */
    version?: number;
}

/**
    * @export
    * @enum {string}
    */
export enum BimConfigConfigTypeEnum {
    SpaceConfig = 'SpaceConfig',
    GridConfig = 'GridConfig',
    SubItem = 'SubItem',
    Coordinate = 'Coordinate'
}
/**
    * @export
    * @enum {string}
    */
export enum BimConfigScopeEnum {
    Project = 'Project',
    Building = 'Building'
}



