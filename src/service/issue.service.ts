import { IssueBO } from "api/generated/model";
import { DefaultApi, IssueApi } from "api";
import { AxiosStatic } from "axios";

export class IssueService {
  // issueApi: DefaultApi;
  issueApi: IssueApi;

  constructor(baseUrl: string, axios: AxiosStatic) {
    this.issueApi = new IssueApi({}, baseUrl, axios);
  }

  async listIssueByTeamId(teamId: string, type?: string) {
    const response = await this.issueApi.getIssueVosByTeamIdUsingGET(
      teamId,
      undefined,
      undefined,
      type,
    );
    return response.data.data || [];
  }

  async listIssueByDatasetIds(unitIds: string[], type?: string) {
    const response = await this.issueApi.getIssueVosByDatasetIdUsingPOST(
      unitIds,
      undefined,
      type,
    );
    return response.data.data || [];
  }

  async createIssue(issue: IssueBO) {
    const response = await this.issueApi.createIssueUsingPUT({
      ...issue,
      camera: JSON.stringify({
        appKey: "BIM-MODEL",
        schemaKey: "CameraInfo",
        schemaVersion: 1,
        data: issue.camera,
      }),
    });
    return response.data.data;
  }

  async dealIssue(body: object) {
    const response = await this.issueApi.dealIssueUsingPOST(body);
    return response.data.data;
  }

  async reopenIssue(body: object) {
    const response = await this.issueApi.reopenIssueUsingPOST(body);
    return response.data.data;
  }

  async finishIssue(body: object) {
    const response = await this.issueApi.submitIssueUsingPOST(body);
    return response.data.data;
  }

  async solveIssue(body: object) {
    const response = await this.issueApi.solveIssueUsingPOST(body);
    return response.data.data;
  }

  async closeIssue(body: object) {
    const response = await this.issueApi.closeIssueUsingPOST(body);
    return response.data.data;
  }

  async loadIssue(issueId: number) {
    const response = await this.issueApi.getIssueVoByIdUsingGET(issueId);
    return response.data.data;
  }
}
