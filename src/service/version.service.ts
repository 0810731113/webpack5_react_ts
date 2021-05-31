import { AddInterceptors } from "function/interceptors";
import { bfproxyService, authService } from "service";
import { VersionApi, DataSetApi } from "api";
import {} from "api/generated/model";
import Axios, { AxiosInstance } from "axios";

export interface VersionInfoObj {
  name: string | undefined;
  version: number | undefined;
  teamId: string | undefined;
  updateTime: string | undefined;
  ownerId?: string | undefined;
  displayVersion?: string | undefined;
}

export class VersionService {
  versionApi: VersionApi;

  workUnitApi: DataSetApi;

  constructor(baseUrl: string, axios: AxiosInstance) {
    this.versionApi = new VersionApi({}, baseUrl, axios);
    this.workUnitApi = new DataSetApi({}, baseUrl, axios);

    AddInterceptors(axios, "version");
  }

  async modifyDescription(
    datasetId: string,
    versionId: number,
    description: string,
  ) {
    const response = await this.versionApi.updateVersionInfoUsingPUT(
      datasetId,
      versionId,
      authService.getUserId(),
      {
        description: description ?? "",
      },
    );
    return response.data.data;
  }

  async deleteVersion(datasetId: string, versionId: number) {
    const response = await this.versionApi.operateVersionStateUsingPOST(
      authService.getUserId(),
      {
        datasetId,
        versionId,
        type: 1,
      },
    );
    return response.data;
  }

  async getLatestVersion(datasetId: string) {
    const response = await this.workUnitApi.getLatestVersionWithMvdUsingGET(
      datasetId,
    );
    return response.data;
  }

  async getVersionsTree(versionIds: string) {
    const response = await this.versionApi.getTreeUsingGET(versionIds);
    return response.data.data;
  }

  async listVersionsByIds(versionIds: number[]) {
    const response = await this.versionApi.getVersionsByIdsAndMvdsUsingPOST(
      versionIds,
    );
    return response.data.data;
  }

  async batchLoadVersionsInfoByIds(versionIds: number[]) {
    const versions = await this.listVersionsByIds(versionIds);
    if (!versions || versions.length === 0) {
      return [];
    }
    const response = await this.workUnitApi.getDataSetsByIdsUsingPOST(
      versions.map((v) => v.dataSetId!),
    );
    const datasets = response.data.data!;

    return versions.map((v) => {
      const ds = datasets.find((_ds) => _ds.id === v.dataSetId);
      return {
        name: ds?.name,
        version: v.version,
        displayVersion: v.displayVersion,
        teamId: ds?.teamId,
        updateTime: v.creationTime,
        ownerId: ds?.ownerId,
      };
    });
  }

  async listIncrementElements(
    workUnitId: string,
    endVersion: number,
    startVersion: number,
  ) {
    const response = await this.versionApi.getIncrementElementsUsingGET1(
      workUnitId,
      endVersion,
      startVersion,
    );
    return response.data.data;
  }

  async loadVersionFileId(versionId: number) {
    const response = await this.versionApi.getViewInfoValueByKeyUsingGET(
      "fileId",
      versionId,
    );
    return response.data;
  }

  // async loadVersionProcessId(versionId: number) {
  //   const response = await this.versionApi.getViewInfoValueByKeyUsingGET(
  //     "processId",
  //     versionId,
  //   );
  //   return response.data;
  // }

  async loadViewToken(fileId: string) {
    const response = await bfproxyService.getViewToken(fileId);
    return response.data ?? "";
  }

  async loadVersionViewToken(versionId: number): Promise<ViewTokenResult> {
    const fileId = await this.loadVersionFileId(versionId);
    const token = await this.loadViewToken(fileId.toString());
    return { fileId, token };
  }
}

export interface ViewTokenResult {
  fileId: any;
  token: string;
}
