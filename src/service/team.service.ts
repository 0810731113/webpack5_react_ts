import { Team, TeamCreation } from "api/generated/model";
import { TeamApi } from "api";
import { AxiosStatic } from "axios";
import { authService } from "service";

export class TeamService {
  teamApi: TeamApi;

  constructor(baseUrl: string, axios: AxiosStatic) {
    this.teamApi = new TeamApi({}, baseUrl, axios);
  }

  async listTeams(projectId: string) {
    const response = await this.teamApi.getAllTeamsInProjectUsingGET(projectId);
    return response.data.data;
  }

  async listMyTeam(projectId: string) {
    const response = await this.teamApi.getAllTeamsUsingPOST(
      { projectId },
      true,
      authService.getUserId(),
    );
    return response.data.data;
  }

  async addUserToTeam(userId: string, teamId: string) {
    const response = await this.teamApi.addUserToTeamUsingPOST(teamId, userId);
    return response.data;
  }

  async getTeamInfo(teamId: string) {
    const response = await this.teamApi.getTeamUsingGET(teamId);
    return response.data.data;
  }

  async getUsersInTeams(teamId: string) {
    const response = await this.teamApi.getAllUsersInTeamUsingGET(teamId);
    return response.data.data;
  }

  async getRoleUsersInTeams(projectId: string, teamId: string) {
    const response = await this.teamApi.getAllUserRolesInTeamUsingGET(
      projectId,
      teamId,
    );
    return response.data.data;
  }

  async createTeam(name: string, description: string, projectId: string) {
    const team: TeamCreation = { name, description, projectId };
    const response = await this.teamApi.createTeamUsingPOST(
      authService.getUserId()!,
      team,
    );
    return response.data.data;
  }

  async updateTeam(teamId: string, name: string, description: string) {
    const response = await this.teamApi.updateTeamByIdUsingPUT(teamId, {
      name,
      description,
    });
    return response.data;
  }

  async deleteTeam(teamId: string) {
    const response = await this.teamApi.deleteTeamByIdUsingDELETE(teamId);
    return response.data;
  }

  async deleteUserFromTeam(userId: string, teamId: string) {
    const response = await this.teamApi.deleteUsersFromTeamUsingDELETE(
      teamId,
      userId,
    );
    return response.data;
  }
}
