import { ProjectApi, UserApi } from "api";
import { AxiosStatic } from "axios";
import { first } from "lodash";
import { authService } from "service";

export class UserService {
  userApi: UserApi;

  projectApi: ProjectApi;

  constructor(baseUrl: string, axios: AxiosStatic) {
    this.userApi = new UserApi({}, baseUrl, axios);
    this.projectApi = new ProjectApi({}, baseUrl, axios);
  }

  getUser(userId: string) {
    return this.listUsersByids([userId]).then((users) => first(users));
  }

  async listUsersByPhonePrefix(prefix: string) {
    const response = await this.userApi.getFilterUsersUsingPOST(prefix);
    return response.data.data || [];
  }

  async userinfoById(prefix: string) {
    const response = await this.userApi.getUserInfoByIdUsingGET(prefix);
    return response.data.data;
  }

  async listUsers(projectId: string) {
    const response = await this.projectApi.getAllUsersInProjectUsingGET(
      projectId,
    );
    return response.data.data;
  }

  async listProjectRoleUsers(projectId: string) {
    const response = await this.projectApi.getAllUserRolesInProjectUsingGET(
      projectId,
    );
    return response.data.data;
  }

  async me() {
    const response = await this.userApi.getMeUsingGET(authService.getUserId());
    return response.data.data;
  }

  async listUsersByids(userIds: string[]) {
    const response = await this.userApi.getUsersByIdsUsingPOST(userIds);
    return response.data.data;
  }

  async resourceLimit() {
    const response = await this.userApi.getResourceLimitUsingGET(
      authService.getUserId(),
    );
    return response.data.data;
  }
}
