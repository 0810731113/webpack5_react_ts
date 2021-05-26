import { ElementApi } from "api";
import { AxiosStatic } from "axios";

export default class ElementService {
  elementApi: ElementApi;

  constructor(baseUrl: string, axios: AxiosStatic) {
    this.elementApi = new ElementApi({}, baseUrl, axios);
  }

  async listElementsByVersionid(versionId: number) {
    const response = await this.elementApi.getDataSetElementsUsingGET(
      versionId,
    );
    return response.data || [];
  }

  async listElementsFromIncrement(
    workUnitId: string,
    version: number,
    endVersion?: number,
  ) {
    const response = await this.elementApi.getIncrementElementsUsingGET(
      workUnitId,
      version,
      endVersion,
    );
    return response.data.data || [];
  }
}
