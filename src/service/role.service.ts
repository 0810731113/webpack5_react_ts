import { ResponseListstringDataEnum } from "api-authorization/generated/model";
import { authService } from "service";
import { AuthorizationApi } from "api-authorization";
import { AxiosStatic } from "axios";

export class RoleService {
  roleApi: AuthorizationApi;

  constructor(baseUrl: string, axios: AxiosStatic) {
    this.roleApi = new AuthorizationApi({}, baseUrl, axios);
  }

  async getUserRoleByProjectId(projectId: string, userId: string) {
    const response = await this.roleApi.getUserRolesInProjectUsingGET(
      projectId,
      userId,
    );

    return (response.data.data as unknown[]) as ProjectRole[];
  }

  async getMyResourcesByProjectId(projectId: string) {
    const response = await this.roleApi.getResourcePermissionInProjectUsingGET(
      projectId,
      authService.getUserId(),
    );

    return response.data.data ?? [];
  }

  async getUserRolePermissions(role: ProjectRole) {
    const response = await this.roleApi.getResourcePermissionByRoleUsingGET(role);
    return response.data.data;
  }

  async getProjectUsersByRole(projectId: string, role: ProjectRole) {
    const response = await this.roleApi.getAllUserIdsByRoleInProjectUsingGET(
      projectId,
      role,
    );
    return response.data.data;
  }

  async editUserRole(projectId: string, roles: ProjectRole[], userId: string) {
    const response = await this.roleApi.assignUserRolesUsingPOST(
      projectId,
      userId,
      roles,
    );
    return response.data;
  }

  async getMyRole(projectId: string) {
    const response = await this.roleApi.getUserRolesInProjectUsingGET(
      projectId,
      authService.getUserId(),
    );
    return (response.data.data as unknown[]) as ProjectRole[];
  }
}

export const RoleName: { [key: string]: string } = {
  ProjectAdmin: "项目管理员",
  ProjectUser: "设计师",
  ProjectExternalUser: "外部成员",
};

export const RoleDescription: { [key: string]: string } = {
  ProjectAdmin:
    "项目的管理员与项目成果的负责人，拥有广联达协同设计平台所有功能模块的编辑权限。",
  ProjectUser:
    "项目中的普通成员，拥有所有广联达协同设计平台个人设计、团队协同、扩展应用和协同设置的编辑权限与其他模块的只读权限。",
  // ProjectExternalUser:
  //   "项目中的外部成员，可以在BIMmake上接收广联达协同设计平台交付的交付单元，但无法在广联达协同设计平台上查看与编辑任何功能模块。",
};

export enum ProjectRole {
  ProjectAdmin = "ProjectAdmin",
  ProjectUser = "ProjectUser",
  ProjectExternalUser = "ProjectExternalUser",
}
