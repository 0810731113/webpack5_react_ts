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


import { OAuth2AccessToken } from './oauth2-access-token';
import { UserInfo } from './user-info';

/**
 * 
 * @export
 * @interface UserInfoWithToken
 */
export interface UserInfoWithToken {
    /**
     * 
     * @type {OAuth2AccessToken}
     * @memberof UserInfoWithToken
     */
    oAuth2AccessToken?: OAuth2AccessToken;
    /**
     * 
     * @type {UserInfo}
     * @memberof UserInfoWithToken
     */
    userInfo?: UserInfo;
}

