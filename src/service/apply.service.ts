import { AddInterceptors } from 'function/interceptors';
import { EnterpriseApi, PersonalAccountApi } from "api-auth";
import {} from "api/generated/model";
import Axios, { AxiosStatic, AxiosInstance } from "axios";

import {
  EnterpriseAccountCreation,
  PersonalAccountCreation,
} from "api-auth/generated/model";

export class ApplyService {
  enterpriseApi: EnterpriseApi;

  personalAccountApi: PersonalAccountApi;

  constructor(baseUrl: string, axios: AxiosInstance) {
    this.enterpriseApi = new EnterpriseApi({}, baseUrl, axios);
    this.personalAccountApi = new PersonalAccountApi({}, baseUrl, axios);


    AddInterceptors(axios, "apply");
  }

  async sendSMS(mobile: string) {
    const response = await this.enterpriseApi.getCodeUsingGET(mobile, "query");
    return response.data;
  }

  async getMainAccountList(mobile: string, code: string) {
    const response = await this.enterpriseApi.getAccountListUsingGET(
      mobile,
      code,
    );
    return response.data.data;
  }

  async verifyUserPassword(userName: string, userPassword: string) {
    const response = await this.enterpriseApi.getUserInfoUsingPOST({
      userName,
      userPassword,
    });
    return response.data.data;
  }

  async submitApply(isNew: boolean, data: EnterpriseAccountCreation) {
    // if (isNew) {
    //   const response = await this.enterpriseApi.createEnterpriseAccountUsingPOST(
    //     data,
    //   );
    //   return response.data.data;
    // } else {
    const response = await this.enterpriseApi.reviewEnterpriseAccountUsingPOST(
      data,
    );
    return response.data.data;
  }

  async registerUserCenter(
    identity: string,
    password: string,
    passwordMobile: string,
  ) {
    const response = await this.enterpriseApi.createEnterpriseAccountV2UsingPOST(
      { identity, password, passwordMobile },
    );
    return response.data.data;
  }

  async reviewPersonalAccount(data: PersonalAccountCreation) {
    const response = await this.personalAccountApi.reviewPersonalAccountUsingPOST(
      data,
    );
    return response.data.data;
  }

  async getCode(mobile: string) {
    console.log(mobile);
    const response = await this.personalAccountApi.getCodeUsingGET1(
      mobile,
      "query",
    );
    return response.data;
  }
}
