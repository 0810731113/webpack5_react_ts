import { AddInterceptors } from 'function/interceptors';
import { EnterpriseApi } from "api-auth";
import Axios, { AxiosStatic, AxiosInstance } from "axios";

export class EnterpriseService {
  enterpriseApi: EnterpriseApi;

  constructor(baseUrl: string, axios: AxiosInstance) {
    this.enterpriseApi = new EnterpriseApi({}, baseUrl, axios);

    AddInterceptors(axios, "enterprise");
  }

  async getSubAccounts() {
    const body = {
      pageNum: 1,
      pageSize: 200,
    };
    const response = await this.enterpriseApi.getEnterpriseMemberUsingPOST(
      "",
      body,
    );

    return response.data.data?.list ?? [];
  }

  async getSubAccountsWithMain() {
    const body = {
      pageNum: 1,
      pageSize: 200,
    };
    const response = await this.enterpriseApi.getEnterpriseMemberAndEnterpriseUsingPOST(
      "",
      body,
    );

    return response.data.data?.list ?? [];
  }
}
