// import bimhomeConfig from './bimhomeconfig';

// const dynamicConfig = {
//     get prodlibId() {
//         if (this._prodlibId) {
//             return this._prodlibId;
//         }

//         return bimhomeConfig.DefaultProdlibId;
//     },

//     get prodlibToken() {
//         if (bimhomeConfig.SOS) {
//             return bimhomeConfig.SOSToken;
//         }

//         if (this._prodlibToken) {
//             return this._prodlibToken;
//         }

//         return bimhomeConfig.DefaultProdlibToken;
//     },

//     get clientId() {
//         if (this._clientId) {
//             return this._clientId;
//         }

//         return bimhomeConfig.DefaultProdClientId;
//     },

//     get clientSecret() {
//         if (this._clientSecret) {
//             return this._clientSecret;
//         }

//         return bimhomeConfig.DefaultProdClientSecret;
//     },

//     get tenantid() {
//         if (this._tenantid) {
//             return this._tenantid;
//         }

//         return bimhomeConfig.DefaultProdTenantId;
//     },

//     get cloudDMToken() {
//         if (bimhomeConfig.SOS) {
//             return bimhomeConfig.SOSToken;
//         }

//         if (this._cloudDMToken) {
//             return this._cloudDMToken;
//         }

//         return this.prodlibToken;
//     },

//     get fileServiceToken() {
//         if (bimhomeConfig.SOS) {
//             return bimhomeConfig.SOSToken;
//         }

//         if (this._fileserviceToken) {
//             return this._fileserviceToken;
//         }

//         return this.prodlibToken;
//     },

//     get renderHubToken() {
//         if (bimhomeConfig.SOS) {
//             return bimhomeConfig.SOSToken;
//         }

//         if (this._renderHubToken) {
//             return this._renderHubToken;
//         }

//         return this.prodlibToken;
//     },

//     get fileManagerUrl() {
//         if (this._fileManagerUrl) {
//             return this._fileManagerUrl;
//         }

//         return bimhomeConfig.FileManagerUrl;
//     },

//     get gbmpToken() {
//         if (bimhomeConfig.SOS) {
//             return bimhomeConfig.SOSToken;
//         }

//         if (this._gbmpToken) {
//             return this._gbmpToken;
//         }

//         return this.prodlibToken;
//     },

//     set prodlibId(id) {
//         this._prodlibId = id;
//     },

//     set prodlibToken(token) {
//         this._prodlibToken = token;
//     },

//     set clientId(c) {
//         this._clientId = c;
//     },

//     set clientSecret(c) {
//         this._clientSecret = c;
//     },

//     set tenantid(t) {
//         this._tenantid = t;
//     },

//     set cloudDMToken(token) {
//         this._cloudDMToken = token;
//     },

//     set fileServiceToken(token) {
//         this._fileserviceToken = token;
//     },

//     set renderHubToken(token) {
//         this._renderHubToken = token;
//     },

//     set fileManagerUrl(url) {
//         this._fileManagerUrl = url;
//     },

//     set gbmpToken(token) {
//         this._gbmpToken = token;
//     }

// }

// export default dynamicConfig;