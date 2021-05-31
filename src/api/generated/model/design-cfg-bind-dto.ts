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
 * @interface DesignCfgBindDto
 */
export interface DesignCfgBindDto {
    /**
     * 
     * @type {number}
     * @memberof DesignCfgBindDto
     */
    cfgId?: number;
    /**
     * 
     * @type {string}
     * @memberof DesignCfgBindDto
     */
    configType?: DesignCfgBindDtoConfigTypeEnum;
    /**
     * 
     * @type {string}
     * @memberof DesignCfgBindDto
     */
    dataId?: string;
    /**
     * 
     * @type {string}
     * @memberof DesignCfgBindDto
     */
    projectId?: string;
}

/**
    * @export
    * @enum {string}
    */
export enum DesignCfgBindDtoConfigTypeEnum {
    SpaceConfig = 'SpaceConfig',
    GridConfig = 'GridConfig',
    SubItem = 'SubItem',
    Coordinate = 'Coordinate'
}



