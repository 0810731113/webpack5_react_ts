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


import { ReduceAppendix } from './reduce-appendix';

/**
 * 
 * @export
 * @interface DatasetPushRequest
 */
export interface DatasetPushRequest {
    /**
     * 
     * @type {ReduceAppendix}
     * @memberof DatasetPushRequest
     */
    appendix?: ReduceAppendix;
    /**
     * 当前版本数据字节大小
     * @type {number}
     * @memberof DatasetPushRequest
     */
    byteSize?: number;
    /**
     * 工作单元修改的版本
     * @type {number}
     * @memberof DatasetPushRequest
     */
    datasetBaseVersion?: number;
    /**
     * Meta字典
     * @type {object}
     * @memberof DatasetPushRequest
     */
    metaInfoMap?: object;
    /**
     * 可见构件数量
     * @type {number}
     * @memberof DatasetPushRequest
     */
    suiteCount?: number;
    /**
     * 编辑权限的Token信息
     * @type {string}
     * @memberof DatasetPushRequest
     */
    token?: string;
    /**
     * 上传总分片数
     * @type {number}
     * @memberof DatasetPushRequest
     */
    totalPacketCount?: number;
    /**
     * 
     * @type {string}
     * @memberof DatasetPushRequest
     */
    uploadId?: string;
    /**
     * 数据校验文件
     * @type {string}
     * @memberof DatasetPushRequest
     */
    verify?: string;
}

