import { AddInterceptors } from "function/interceptors";
import { removeCookie, getUrlParms } from "function/cookie.func";
import { LoginApi } from "api-auth";
import {} from "api/generated/model";
import Axios, { AxiosStatic, AxiosInstance } from "axios";

export class LoginService {
  loginApi: LoginApi;

  constructor(baseUrl: string, axios: AxiosInstance) {
    this.loginApi = new LoginApi({}, baseUrl, axios);

    AddInterceptors(axios, "login");
  }

  async login(userName: string, userPassword: string) {
    const info = {
      userName,
      userPassword,
    };
    return this.loginApi.webLoginUsingPOST(info);
  }

  async maintainLogin(userName: string, userPassword: string) {
    const info = {
      userName,
      userPassword,
      appKey: getUrlParms("appKey") ?? "",
      appSecret: getUrlParms("appSecret") ?? "",
    };
    return this.loginApi.webLoginUsingPOST(info);
  }

  logout() {
    if (window.BroadcastChannel) {
      const channel = new BroadcastChannel("cookieChannel");
      channel.postMessage("logout");
    }
  }

  removeSession() {
    removeCookie("userId");
    removeCookie("isPersonalAccount");
    removeCookie("accessToken");
  }
}
