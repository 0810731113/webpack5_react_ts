import { authService } from "service";
import { DataSetApi, FolderApi, VersionApi } from "api";
import { DataSetCreation, VersionVO } from "api/generated/model";
import { AxiosStatic } from "axios";

export class XmonitorService {
  workUnitApi: DataSetApi;

  constructor(baseUrl: string, axios: AxiosStatic) {
    this.workUnitApi = new DataSetApi({}, baseUrl, axios);
  }

  async getMonitorToken(dsIds: string[]) {
    const res = await this.workUnitApi.listDataSetXMonitorByDSIdsUsingPOST(
      dsIds,
      authService.getUserId()!,
    );
    return res.data.data;
  }

  async releaseToken(token: string) {
    const res = await this.workUnitApi.releaseDataSetMonitorByTokenUsingPUT(
      token,
      authService.getUserId()!,
      "true",
    );

    return res.data.data;
  }
}
