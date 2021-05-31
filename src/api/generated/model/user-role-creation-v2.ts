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


import { EnterpriseMember } from './enterprise-member';

/**
 * 
 * @export
 * @interface UserRoleCreationV2
 */
export interface UserRoleCreationV2 {
    /**
     * 
     * @type {Array<EnterpriseMember>}
     * @memberof UserRoleCreationV2
     */
    members?: Array<EnterpriseMember>;
    /**
     * 
     * @type {string}
     * @memberof UserRoleCreationV2
     */
    roleType?: UserRoleCreationV2RoleTypeEnum;
}

/**
    * @export
    * @enum {string}
    */
export enum UserRoleCreationV2RoleTypeEnum {
    ProjectAdmin = 'ProjectAdmin',
    ProjectUser = 'ProjectUser',
    ProjectExternalUser = 'ProjectExternalUser',
    GlobalVisitor = 'GlobalVisitor',
    EnterpriseVisitor = 'EnterpriseVisitor',
    ProjectVisitor = 'ProjectVisitor',
    BetaUser = 'BetaUser',
    BopsAdmin = 'BopsAdmin',
    BopsMarket = 'BopsMarket',
    BopsProduct = 'BopsProduct',
    BopsUser = 'BopsUser',
    BopsDeveloper = 'BopsDeveloper',
    BimmakeArchvie = 'BimmakeArchvie'
}



