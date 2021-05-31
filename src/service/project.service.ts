import { ProjectApi, SampleProjectApi } from "api";
import {
  ProjectCreation,
  ProjectCreationV2,
  Project,
  ProjectVO,
} from "api/generated/model";
import { Modal } from "antd";
import consts from "consts";
import { AxiosStatic } from "axios";
import {
  authService,
  teamService,
  userService,
  specialtyService,
  spaceSettingsService,
  gridSettingsService,
  roleService,
} from "service";
import { popupError } from "function/apiCommonError";
import { formStandardCodeObj, PORPORTYPE_CODE } from "function/standard.func";
import { ProjectStatusEnum } from "../api/generated/model/project";
import { formAdressData } from "../page/ProjectPage/ProjectSettingsPage/ProjectInfoSettingsPage/SelectAddress";

const { PUBLIC_URL } = consts;

export class ProjectService {
  projectApi: ProjectApi;

  sampleProjectApi: SampleProjectApi;

  constructor(baseUrl: string, axios: AxiosStatic) {
    this.projectApi = new ProjectApi({}, baseUrl, axios);
    this.sampleProjectApi = new SampleProjectApi({}, baseUrl, axios);
  }

  async listProjects(status?: ProjectStatusEnum): Promise<Project[]> {
    if (status) {
      return this.listProjectsByStatus(status);
    }
    const resp = await this.projectApi.getAllProjectsUsingGET(
      authService.getUserId(),
    );
    return resp.data ?? [];
  }

  async ownerProjects(): Promise<ProjectVO[] | undefined> {
    const resp = await this.projectApi.getProjectsByOwnerUsingGET(
      authService.getUserId(),
    );
    return resp.data.data;
  }

  async listProjectsByStatus(status: ProjectStatusEnum) {
    const resp = await this.projectApi.getProjectsByStatusUsingGET(
      status,
      authService.getUserId(),
    );
    return resp.data;
  }

  // 废弃
  // async loadProject(projectId: string) {
  //   const resp = await this.projectApi.getProjectUsingGET(projectId);
  //   return resp.data;
  // }

  async getProjectInfoV2(projectId: string) {
    const resp = await this.projectApi.getProjectV2UsingGET(projectId);
    return resp.data.data;
  }

  async loadProjectById(projectId: string) {
    const resp = await this.projectApi.getProjectV2UsingGET(projectId);
    return resp.data.data;
  }

  async addUserToProject(userId: string, projectId: string) {
    const response = await this.projectApi.addUserToProjectUsingPOST(
      projectId,
      userId,
    );
    return response.data;
  }

  async deleteUserFromProject(userId: string, projectId: string) {
    const response = await this.projectApi.deleteUserFromProjectUsingDELETE(
      projectId,
      userId,
    );
    return response.data;
  }

  async loadRequiredData(projectId: string) {
    const projectDataLoder = this.loadProjectById(projectId);
    const teamsDataLoader = teamService.listTeams(projectId);
    const usersDataLoader = userService.listUsers(projectId);
    const specialtyDataLoader = specialtyService.querySepcialty(projectId);
    const roleDataLoader = roleService.getMyRole(projectId);
    const authResourcesLoader = roleService.getMyResourcesByProjectId(
      projectId,
    );
    // const meLoader = userService.me();
    return Promise.all([
      projectDataLoder,
      teamsDataLoader,
      usersDataLoader,
      specialtyDataLoader,
      roleDataLoader,
      authResourcesLoader,
    ]).catch((err) => {
      if (err?.response?.data?.code === 40018) {
        popupError._modal?.destroy();
        Modal.warning({
          title: "此项目已被删除",
          content: `如有疑问请联系相关负责人。`,
          okText: `确定`,
          onOk() {
            window.location.href = `${PUBLIC_URL}/workspace?viewType=personal`;
          },
        });
        return null;
      }
    });
  }

  async createProject(
    name: string,
    status: ProjectStatusEnum,
    description: string,
    thumbnail: string,
    templateId: string,
  ) {
    const body: ProjectCreation = {
      name,
      status: status as any,
      description,
      thumbnail,
      templateId,
    };

    const resp = await this.projectApi.createProjectUsingPOST(
      authService.getUserId()!,
      body,
    );
    const newProject = resp.data.data;
    if (newProject && newProject.id && !templateId) {
      await spaceSettingsService.postDefault(newProject.id);
      // await gridSettingsService.postDefault(newProject.id);
    }

    return resp.data;
  }

  async createNewProject(info: any) {
    const body: ProjectCreationV2 = {
      name: info.name,
      status: info.status,
      description: info.description,
      thumbnail: info.thumbnail,
      standardProperties: [
        ...formAdressData(info),
        formStandardCodeObj(PORPORTYPE_CODE.buildingType, info.buildingType),
        formStandardCodeObj(PORPORTYPE_CODE.structureType, info.structureType),
        formStandardCodeObj(
          PORPORTYPE_CODE.buildingEnterprise,
          info.buildingEnterprise,
        ),
        formStandardCodeObj(
          PORPORTYPE_CODE.designEnterprise,
          info.designEnterprise,
        ),
      ],
      // buildingType: info.buildingType,
      // structureType: info.structureType,
      // buildingEnterprise: info.buildingEnterprise,
      // designEnterprise: info.designEnterprise,
    };

    const resp = await this.projectApi.createProjectV3UsingPOST(
      authService.getUserId()!,
      body as any,
    );
    const newProject = resp.data.data;
    if (newProject && newProject.id) {
      await spaceSettingsService.postDefault(newProject.id);
    }
    return resp.data;
  }

  async modifyProject(info: any) {
    if (info.id) {
      const resp = await this.projectApi.updateProjectV2UsingPUT(info.id, {
        name: info.name,
        status: info.status as any,
        description: info.description,
        thumbnail: info.thumbnail,
        standardProperties: [
          ...formAdressData(info),
          formStandardCodeObj(PORPORTYPE_CODE.buildingType, info.buildingType),
          formStandardCodeObj(
            PORPORTYPE_CODE.structureType,
            info.structureType,
          ),
          formStandardCodeObj(
            PORPORTYPE_CODE.buildingEnterprise,
            info.buildingEnterprise,
          ),
          formStandardCodeObj(
            PORPORTYPE_CODE.designEnterprise,
            info.designEnterprise,
          ),
        ],
        // buildingType: info.buildingType,
        // structureType: info.structureType,
        // buildingEnterprise: info.buildingEnterprise,
        // designEnterprise: info.designEnterprise,
      });
      return resp.data;
    }
    return Promise.reject();
  }

  async getUsersByProjectId(projectId: string) {
    const resp = await this.projectApi.getAllUsersInProjectUsingGET(projectId);
    return resp.data;
  }

  async isDeletable(projectId: string) {
    const resp = await this.projectApi.isProjectDeletableUsingGET(projectId);
    return resp.data;
  }

  async deleteProject(projectId: string) {
    return this.projectApi.deleteProjectByIdUsingDELETE1(
      projectId,
      authService.getUserId(),
    );
  }

  async updateParticipant(onOff: boolean) {
    const response = await this.projectApi.switchParticipationStatusUsingPUT(
      onOff,
      authService.getUserId(),
    );
    return response.data;
  }

  async addUserProjectWithRole(projectId: string, userRoleCreation: any) {
    const response = await this.projectApi.addUsersToProjectWithRoleV2UsingPOST(
      projectId,
      userRoleCreation,
    );
    return response.data;
  }

  async listSampleProjects(): Promise<ProjectVO[]> {
    const resp = await this.sampleProjectApi.getAllSampleProjectsV2UsingGET(
      authService.getUserId(),
    );
    return resp.data.data ?? [];
  }
}
