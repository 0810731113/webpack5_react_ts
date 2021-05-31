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
 * @interface ElementQuery
 */
export interface ElementQuery {
    /**
     * 可选。 查增量数据需要，结果为(beginVersion,version], beginVersion的修改不包括。
     * @type {number}
     * @memberof ElementQuery
     */
    beginVersion?: number;
    /**
     * 可选。 指定属性名。主键不需要提供。当mvd不填时有效
     * @type {Array<string>}
     * @memberof ElementQuery
     */
    columns?: Array<string>;
    /**
     * 可选。 选择集ID
     * @type {string}
     * @memberof ElementQuery
     */
    elementSelectionSetId?: string;
    /**
     * 可选。 是否去掉deleted构件
     * @type {boolean}
     * @memberof ElementQuery
     */
    excludeDeleted?: boolean;
    /**
     * 可选。 指定构件ID
     * @type {Array<string>}
     * @memberof ElementQuery
     */
    ids?: Array<string>;
    /**
     * 可选。 返回非指定属性
     * @type {boolean}
     * @memberof ElementQuery
     */
    include?: boolean;
    /**
     * 可选。 指定mvd。
     * @type {string}
     * @memberof ElementQuery
     */
    mvd?: string;
    /**
     * 可选。 回调url
     * @type {string}
     * @memberof ElementQuery
     */
    notifyUrl?: string;
    /**
     * 可选 -1 查最新版.
     * @type {number}
     * @memberof ElementQuery
     */
    targetVersion?: number;
    /**
     * 可选。 是否支持动态打包。false的时候，为固定500构件一个包
     * @type {boolean}
     * @memberof ElementQuery
     */
    useDynamicPackageSize?: boolean;
}


