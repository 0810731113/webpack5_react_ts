import { BimfaceControllerApi, TranslateControllerApi } from "api-bfproxy";
import {} from "api/generated/model";

import Axios, { AxiosStatic } from "axios";

export class BfproxyService {

  bimfaceApi: BimfaceControllerApi;

  translateApi: TranslateControllerApi;

  constructor(baseUrl: string, axios: AxiosStatic) {
    this.bimfaceApi = new BimfaceControllerApi({}, baseUrl, axios);
    this.translateApi = new TranslateControllerApi({}, baseUrl, axios);
  }

  async getFileDownloadUrl(fileId: string) {
    const response = await this.bimfaceApi.getFileDownloadUrlUsingGET(fileId);
    return response.data as any;
  }

  async getViewToken(fileId: string) {
    const response = await this.bimfaceApi.getViewTokenUsingGET(fileId);
    return response.data
  }

  async startWorker(versionId: number, type: string) {
    const data = {
      versionId,
      toType: type,
    };

    const response = await this.translateApi.addJobUsingPOST(data);
    return response.data;
  }
}
