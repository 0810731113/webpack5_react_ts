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


import { FilterConditionList } from './filter-condition-list';

/**
 * 
 * @export
 * @interface ComplexFilterCondition
 */
export interface ComplexFilterCondition {
    /**
     * 
     * @type {Array<FilterConditionList>}
     * @memberof ComplexFilterCondition
     */
    conditionLists?: Array<FilterConditionList>;
    /**
     * 
     * @type {Array<string>}
     * @memberof ComplexFilterCondition
     */
    joiner?: Array<string>;
}

