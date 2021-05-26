// import bimhomeConfig from '../../config/bimhomeconfig';
// import Axios from 'axios';

// Axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';

// const codeapi = {

//     getDsByFolder(folderId) {
//         return Axios.get(bimhomeConfig.CdgUrl + '/dataset/byfolder?folderId=' + folderId);
//     },
//     getAllPropertyCode() {
//         return Axios.get(bimhomeConfig.BimcodeUrl + '/property/all/flat');
//     },
//     getPropertyCodeByCode(code) {
//         return Axios.get(bimhomeConfig.BimcodeUrl + '/property/bycode/flat?code=' + code);
//     },
//     getPropertyCodeByType(codeType) {
//         return Axios.get(bimhomeConfig.BimcodeUrl + '/property/bycodetype/flat?type=' + codeType);
//     },
//     deletePropertyCodeByCode(code) {
//         return Axios.delete(bimhomeConfig.BimcodeUrl + '/property/bycode?code=' + code);
//     }
// }

// export { codeapi }