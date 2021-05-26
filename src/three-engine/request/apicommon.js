import axios from 'axios';
import { getCookie } from '../app/ui/utils/common';



const create = () => {
    let token = getCookie('accessToken');
    let userId = getCookie('userId');

    let config = { headers: {} };

    if (token) {
        config.headers['Authorization'] = `bearer ${token}`
    }

    if (userId) {
        config.headers['x-gdc-userid'] = userId;
    // } else {
    //     config.headers['x-gdc-userid'] = '6673157553591517504';
    }

    console.log('axios_config:', config)

    let instance = axios.create(config)
    // instance.interceptors.response.use((res) => {

    //     let code = res.data.code;
    //     switch (code) {
    //         case 10001: {
    //             alert(`api error 10001: ${res.data.msg}`);
    //             return Promise.reject(res.data.msg);
    //         }

    //         case 10002: {
    //             alert(`api error 10002: ${res.data.msg}`);
    //             return Promise.reject(res.data.msg);
    //         }

    //         default:
    //             return res;
    //     }

    // }, (err) => {
    //     console.error(err)
    // });
    return instance
}

export const Axios = create()