import { PermissionApi } from "api";
import {} from "api/generated/model";
import { AxiosStatic } from "axios";

export class PermissionService {
  permissionApi: PermissionApi;

  constructor(baseUrl: string, axios: AxiosStatic) {
    this.permissionApi = new PermissionApi({}, baseUrl, axios);
  }

  async listPermission(teamId: string, type?: "Trust" | "TrustBy") {
    const response = await this.permissionApi.getPermissionResourcesUsingGET(
      teamId,
      type,
    );
    return response.data.data;
  }

  async createTrustTeam(teamId: string, trustTeamId: string) {
    const response = await this.permissionApi.createPermissionUsingPOST(
      teamId,
      trustTeamId,
    );
    return response.data.data;
  }

  async deleteTrustTeam(teamId: string, trustTeamId: string) {
    const response = await this.permissionApi.deletePermissionUsingDELETE(
      teamId,
      trustTeamId,
    );
    return response.data;
  }
}
