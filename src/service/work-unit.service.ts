import { authService } from "service";
import { DataSetApi, FolderApi, VersionApi } from "api";
import { DataSetCreation, VersionVO } from "api/generated/model";
import { AxiosStatic } from "axios";
import { wait } from "function/async.func";
import { getVersionBfStatus } from "function/bimface.func";
import { getCookie } from "function/cookie.func";
import { orderBy } from "lodash";

export class WorkUnitService {
  workUnitApi: DataSetApi;

  folderApi: FolderApi;

  versionApi: VersionApi;

  constructor(baseUrl: string, axios: AxiosStatic) {
    this.workUnitApi = new DataSetApi({}, baseUrl, axios);
    this.folderApi = new FolderApi({}, baseUrl, axios);
    this.versionApi = new VersionApi({}, baseUrl, axios);
  }

  async getWorkUnitById(dsId: string) {
    const res = await this.workUnitApi.getDataSetByIdUsingGET(dsId);
    return res.data.data;
  }

  async getWorkUnitByIdWithDeleted(dsId: string) {
    const res = await this.workUnitApi.getDataSetByIdUsingGET(dsId, false);
    return res.data.data;
  }

  async getPersonalWorkUnits(projectId: string) {
    const res = await this.workUnitApi.getDataSetsByProjectAndOwnerV2UsingGET(
      projectId,
      authService.getUserId(),
    );

    return res.data.data ?? [];
  }

  async getWorkUnitsByTeamId(
    teamId: string,
    status: "draft" | "committed" = "draft",
  ) {
    const res = await this.workUnitApi.getDataSetsInTeamByStatusUsingGET(
      teamId,
      status,
    );

    return res.data.data || [];
  }

  async deleteWorkUnit(workUnitId: string) {
    const response = await this.workUnitApi.deleteDataSetUsingDELETE(
      workUnitId,
    );
    return response.data;
  }

  async updateWorkUnit(workUnitId: string, data: DataSetCreation) {
    const response = await this.workUnitApi.updateDataSetByIdUsingPUT(
      workUnitId,
      data,
    );
    return response.data;
  }

  async getBatchWorkUnitsByTeamId(
    teamIds: string[],
    status: "draft" | "committed" = "draft",
  ) {
    const res = await this.workUnitApi.getDataSetsInTeamsUsingPOST(
      teamIds,
      status,
    );

    const workunits = res.data.data ?? [];

    return workunits;
  }

  async getBatchPanelWorkUnitsByTeamId(
    teamIds: string[],
    status: "draft" | "committed" = "draft",
  ) {
    const res = await this.workUnitApi.getDataSetsInTeamsV2UsingPOST(
      teamIds,
      status,
    );

    const workunits = res.data.data ?? [];

    return workunits;
  }

  async getDatasetsBySpecialtyId(specialtyId: string) {
    const res = await this.workUnitApi.getDataSetsBySpecialtyUsingGET(
      specialtyId,
    );
    return res.data.data;
  }

  async createWorkUnit(
    folderId: string,
    name: string,
    type?: string,
    teamId?: string,
  ) {
    const response = await this.workUnitApi.createDataSetUsingPOST({
      folderId,
      name,
      type,
      teamId,
    });
    return response.data.data!;
  }

  async createNewWorkUnit(
    name: string,
    teamId: string,
    specialtyId: string,
    type: string,
    description = "",
    ownerId?: string,
  ) {
    const response = await this.workUnitApi.createDataSetUsingPOST({
      description,
      name,
      teamId,
      specialtyId,
      type,
      ownerId,
    });
    return response.data;
  }

  async createNoDefaultOwnerWorkUnit(
    name: string,
    teamId: string,
    specialtyId: string,
    type: string,
    description = "",
    ownerId?: string,
  ) {
    const response = await this.workUnitApi.createDataSetV3UsingPOST({
      description,
      name,
      teamId,
      specialtyId,
      type,
      ownerId,
    });
    return response.data;
  }

  async createVersion(workUnitId: string, sourceFile: string) {
    const response = await this.workUnitApi.createVersionUsingPUT(
      workUnitId,
      {},
      sourceFile,
    );
    return response.data;
  }

  async listWorkUnits(folderId: string) {
    const response = await this.workUnitApi.getDataSetsByFolderUsingGET(
      folderId,
    );
    return response.data;
  }

  async listWorkUnitsByProjectId(
    projectId: string,
    status?: "draft" | "committed",
  ) {
    const response = await this.workUnitApi.getDataSetsInProjectByStatusUsingGET(
      projectId,
      status,
    );
    return response.data.data ?? [];
  }

  async listCloudifyWorkUnitsByProjectId(
    projectId: string,
    status?: "draft" | "committed",
  ) {
    return this.listWorkUnitsByProjectId(projectId, status).then((workUnits) =>
      workUnits.filter((wu) => wu.type === "workunit"),
    );
  }

  async listWorkUnitsByTeamId(teamId: string, status?: "draft" | "committed") {
    const response = await this.workUnitApi.getDataSetsInTeamByStatusUsingGET(
      teamId,
      status,
    );
    return response.data.data ?? [];
  }

  async listWorkUnitsByTypeByTeamId(teamId: string, type: string) {
    const response = await this.workUnitApi.getDataSetInTeamByTypeUsingGET(
      teamId,
      type,
    );
    return response.data.data ?? [];
  }

  async listVersionsByWorkUnitIds(
    workUnitIds: Array<string>,
    onlySuccess?: boolean,
    status?: "draft" | "committed",
  ) {
    const response = await this.workUnitApi.getDatasetsVersionsByStatusMVDUsingPOST(
      workUnitIds,
      "mvd",
      onlySuccess,
      status,
    );
    return orderBy(response.data.data, "version").reverse();
  }
  // async listWorkUnitVersions(workUnitId: string) {
  //   const response = await this.workUnitApi.getDataSetVersionsUsingGET(
  //     workUnitId,
  //   );
  //   return orderBy(response.data, "version").reverse();
  // }

  async loadWorkUnitVersion(workUnitId: string, versionNo: number) {
    const response = await this.workUnitApi.getVersionUsingGET(
      workUnitId,
      versionNo,
    );
    return response.data;
  }

  async loadCommitWorkUnitIds(draftWorkUnitIds: string[]) {
    const response = await this.workUnitApi.getCommittedDataSetsUsingPOST(
      draftWorkUnitIds,
    );
    return response.data.data;
  }

  // async pollVersion(
  //   workUnitId: string,
  //   versionNo: number,
  //   onComplete: () => void,
  //   onTimeout: () => void,
  //   interval = 5000,
  //   maxRetries = 10,
  // ) {
  //   for (let count = 1; count <= maxRetries; count++) {
  //     let version = await this.loadWorkUnitVersion(workUnitId, versionNo);
  //     const status = getVersionBfStatus(version);
  //     if (status === "success") {
  //       onComplete();
  //       break;
  //     } else if (status === "failed") {
  //       onComplete();
  //       break;
  //     } else if (status === "processing") {
  //     } else if (!status) {
  //     }

  //     await wait(interval);
  //     console.log("next try", count);

  //     if (count === maxRetries) {
  //       onTimeout();
  //     }
  //   }
  // }

  async loadWorkUnitById(datasetId: string) {
    const response = await this.workUnitApi.getDatasetUsingGET(datasetId);
    return response.data.data;
  }

  async loadWorkUnitCommittedVersions(workUnitId: string) {
    const response = await this.workUnitApi.getDatasetsVersionsByStatusMVDUsingPOST(
      [workUnitId],
      "mvd",
      true,
      "committed",
    );
    return orderBy(response.data.data, "version").reverse();
  }

  async batchLoadWorkUnitsVersions(workUnitIdList: string[]) {
    const response = await this.versionApi.getVersionsByDataSetIdsMVDUsingPOST(
      workUnitIdList,
    );
    const versions = response.data.data as VersionVO[];
    return versions.reduce<{ [workUnitId: string]: VersionVO[] }>(
      (pre, current) => {
        pre[current.dataSetId!] = pre[current.dataSetId!] || [];
        pre[current.dataSetId!].push(current);
        return pre;
      },
      {},
    );
  }

  async batchLoadCommittedWorkUnitsVersions(workUnitIdList: string[]) {
    const response = await this.workUnitApi.getDatasetsVersionsByStatusMVDUsingPOST(
      workUnitIdList,
      "mvd",
      true,
      "committed",
    );
    const versions = response.data.data as VersionVO[];
    return versions.reduce<{ [workUnitId: string]: VersionVO[] }>(
      (pre, current) => {
        pre[current.dataSetId!] = pre[current.dataSetId!] || [];
        pre[current.dataSetId!].push(current);
        return pre;
      },
      {},
    );
  }

  async restoreVersion(dsId: string, version: number) {
    const response = await this.workUnitApi.promoteVersion2UsingPOST(
      dsId,
      version,
    );
    // console.log(response);
    return response.data;
  }
}
