import { AddInterceptors } from "function/interceptors";
import { getCookie } from "function/cookie.func";

import { MaintainApi } from "api-system";
import {} from "api/generated/model";
import Axios, { AxiosStatic, AxiosInstance } from "axios";

export class SystemService {
  maintainApi: MaintainApi;

  constructor(baseUrl: string, axios: AxiosInstance) {
    this.maintainApi = new MaintainApi({}, baseUrl, axios);

    AddInterceptors(axios, "system");
  }

  async getUseable() {
    const response = await this.maintainApi.getMaintainConfigUsingGET();
    return response.data.data;
  }

  async checkPanelVersionUseable() {
    const productVersion = getCookie("productVersion");
    if (productVersion) {
      const response = await this.maintainApi.verifyAppVersionUsingGET(
        productVersion,
      );
      return response.data.data;
    }
    return { usable: true, message: "no msg" };
  }

  async getSystemStatus() {
    const response = await this.maintainApi.getSystemStatusV2UsingGET(
      getCookie("userId"),
    );
    return response.data.data;
  }

  async getMessage(client: "APP" | "WEB" | "PANEL" | "COMMON") {
    const response = await this.maintainApi.getMaintainMessageUsingGET(client);
    return response.data.data;
  }
}
