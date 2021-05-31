import { OverviewApi } from "api-stat/generated/api/overview-api";
import { authService } from "service";

import { AxiosStatic } from "axios";

export class StatService {
  OverviewApi: OverviewApi;

  constructor(baseUrl: string, axios: AxiosStatic) {
    this.OverviewApi = new OverviewApi({}, baseUrl, axios);
  }

  async getGlobalInfo(projectId: string) {
    const res = await this.OverviewApi.getProjectsBasicInfoUsingGET(projectId);
    return res.data.data;
  }

  async getTeamInfo(projectId: string) {
    const res = await this.OverviewApi.getTeamOverviewUsingGET(
      projectId,
      authService.getUserId()!,
    );
    return res.data.data;
  }

  async getPublishedDataSetInfo(projectId: string) {
    const res = await this.OverviewApi.getPublishedDatasetsOverviewUsingGET(
      projectId,
    );
    return res.data.data;
  }

  async getIssueInfo(projectId: string) {
    const res = await this.OverviewApi.getIssuesOverviewUsingGET(projectId);
    return res.data.data;
  }
}
