
export const Utils_findFirstElementTypeInArray = (res, attr, msg) => {
    let arr = ApiUtils_CheckArray(res);
    if (arr && arr.length > 0) {
        return arr[0][attr]
    } else {
        console.error(msg)
        return Promise.reject('返回数组为空');
    }
}

export const Utils_isArray = (arr) => {
    if (arr && arr instanceof Array) {
        return true
    } else {
        console.error('返回结果非数组');
        return false
    }
}

export const ApiUtils_CheckObj = (res) => {
    if (res && res.data && res.data.data) {
        return res.data.data
    } else {
        return Promise.reject('返回结果非标准对象');
    }
}


export const ApiUtils_CheckArray = (res) => {

    if (res && res instanceof Array) {
        return res
    } else if (res.data && res.data instanceof Array) {
        return res.data
    } else if (res.data.data && res.data.data instanceof Array) {
        return res.data.data
    } else {
        console.error(res);
        return Promise.reject('返回结果非数组');
    }

    // var data = res.data.data ? res.data.data : (res.data ? res.data : res);
    // if (data instanceof Array) {
    //     return data;
    // } else {
    //     console.error(res);
    //     return Promise.reject('返回结果非数组');
    // }
}