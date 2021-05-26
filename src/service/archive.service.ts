import { ArchiveApi, VersionApi, DataSetApi } from "api";
import { AxiosStatic } from "axios";
import {
  ArchivePackageCreation,
  ArchiveVersionVO,
  DataSetVO,
  VersionVO,
  Resource,
} from "api/generated/model";
import { authService } from "service";
import { ArchivePackageVO } from "../api/generated/model/archive-package-vo";

export interface ArchivePackageInfo {
  package: ArchivePackageVO;
  versions: ArchiveVersionVO[];
}

export interface PackageVersionInfo {
  dsInfo: DataSetVO;
  vsInfo: VersionVO;
  key: string | number;
}

export class ArchiveService {
  archiveapi: ArchiveApi;

  versionapi: VersionApi;

  datasetapi: DataSetApi;

  constructor(baseUrl: string, axios: AxiosStatic) {
    this.archiveapi = new ArchiveApi({}, baseUrl, axios);
    this.versionapi = new VersionApi({}, baseUrl, axios);
    this.datasetapi = new DataSetApi({}, baseUrl, axios);
  }

  async createArchive(projectId: string, name: string, description: string) {
    const body: ArchivePackageCreation = {
      description,
      name,
      projectId,
    };
    const res = await this.archiveapi.createArchivePackageUsingPOST(
      authService.getUserId()!,
      body,
    );
    return res.data.data;
  }

  async updateArchive(
    packageId: string,
    packageVersionId: number,
    name: string,
    description: string,
  ) {
    const body = {
      description,
      name,
      packageId,
      versionId: packageVersionId,
    };
    const res = await this.archiveapi.updateArchivePackageUsingPUT(
      authService.getUserId()!,
      body,
    );
    return res.data.data;
  }

  async deleteArchive(pkgId: string) {
    const res = await this.archiveapi.dropArchivePackageUsingDELETE(
      pkgId,
      authService.getUserId()!,
    );
    return res.data.data;
  }

  async getAllArchivesVersions(projectId: string) {
    const response = await this.archiveapi.getArchivePackagesByProjectIdUsingGET(
      projectId,
    );

    const packages = response.data.data ?? [];
    return packages;
  }

  // async batchLoadOldArchivesVersions(packageIds: string[]) {
  //   const response = await this.archiveapi.getArchiveVersionsUsingPOST(
  //     packageIds,
  //   );
  //   const pkgVersions = response.data.data ?? [];
  //   return pkgVersions.reduce<{ [pkgId: string]: ArchiveVersionVO[] }>(
  //     (pre, current) => {
  //       pre[current.packageId!] = pre[current.packageId!] || [];
  //       pre[current.packageId!].push(current);
  //       return pre;
  //     },
  //     {},
  //   );
  // }

  async batchLoadArchivesVersions(packageIds: string[]) {
    const response = await this.archiveapi.getArchiveVersions4V2UsingPOST(
      packageIds,
    );
    const pkgVersions = response.data.data ?? [];
    return pkgVersions.reduce<{ [pkgId: string]: ArchiveVersionVO[] }>(
      (pre, current) => {
        pre[current.packageId!] = pre[current.packageId!] || [];
        pre[current.packageId!].push(current);
        return pre;
      },
      {},
    );
  }

  async getArchiveByPackageId(packageId: string) {
    const response = await this.archiveapi.getArchivePackageUsingGET(packageId);
    const pkg = response.data.data;
    return pkg;
  }

  // async getOldArchiveInfoByPackageId(packageId: string) {
  //   let response = await this.archiveapi.getArchivePackageUsingGET(packageId);
  //   let pkg = response.data.data;
  //   let res = await this.archiveapi.getArchiveVersionsByPackageIdUsingGET(
  //     packageId,
  //   );
  //   let versions = res.data.data;
  //   versions?.sort((a, b) => (b.version ?? 0) - (a.version ?? 0));
  //   return { package: pkg!, versions: versions! };
  // }

  async getArchiveInfoByPackageId(packageId: string) {
    const response = await this.archiveapi.getArchivePackageUsingGET(packageId);
    const pkg = response.data.data;
    const res = await this.archiveapi.getArchiveVersionsByPackageId4V2UsingGET(
      packageId,
    );
    const versions = res.data.data;
    versions?.sort((a, b) => (b.version ?? 0) - (a.version ?? 0));
    return { package: pkg!, versions: versions! };
  }

  async postOldAchiveResources(packageId: string, body: Resource[]) {
    const response = await this.archiveapi.addResourcesToPackageUsingPOST(
      packageId,
      authService.getUserId()!,
      body,
    );

    return response.data;
  }

  async postAchiveResources(packageId: string, versionIds: number[]) {
    const body = {
      deliverUnits: versionIds,
    };
    const response = await this.archiveapi.addResourcesToPackage4v2UsingPOST(
      packageId,
      authService.getUserId()!,
      body,
    );

    return response.data;
  }

  async postDraftAchiveResources(packageId: string, versionIds: number[]) {
    const body = {
      deliverUnits: versionIds,
    };
    const response = await this.archiveapi.addResourcesToDraftPackageUsingPOST(
      packageId,
      authService.getUserId()!,
      body,
    );

    return response.data;
  }

  async updateDraftAchiveResources(
    packageId: string,
    versionIds: number[],
    pkgVersionId: number,
  ) {
    const body = {
      deliverUnits: versionIds,
    };
    const response = await this.archiveapi.updateResourcesToDraftPackageUsingPUT(
      packageId,
      pkgVersionId,
      authService.getUserId()!,
      body,
    );

    return response.data;
  }

  async commitDraftAchiveResources(
    packageId: string,
    versionIds: number[],
    pkgVersionId: number,
  ) {
    const body = {
      deliverUnits: versionIds,
    };
    const response = await this.archiveapi.saveDraftArchivePackage2CommitStatusUsingPUT(
      packageId,
      pkgVersionId,
      authService.getUserId()!,
      body,
    );

    return response.data;
  }

  async getPackageVersionIds(packageId: string, versionId: number) {
    const resp = await this.archiveapi.getArchiveVersionByPackageVersionUsingGET(
      packageId,
      versionId,
    );

    const obj = resp.data.data;

    if (obj && obj.content) {
      return obj.content
        .filter((record) => record.type === "Version")
        .map((record) => parseInt(record.resourceId!));
    } 
      return [];
    
  }

  async getPackageVersionInfo(packageId: string, versionId: number) {
    const result: PackageVersionInfo[] = [];

    if (packageId && versionId) {
      const versionIds = await this.getPackageVersionIds(packageId, versionId);
      if (versionIds && versionIds.length > 0) {
        const resVer = await this.versionapi.getVersionsByIdsAndMvdsUsingPOST(
          versionIds,
        );
        const versions = resVer.data.data!;

        const dsIds = versions.map((version) => version.dataSetId!);
        const resDs = await this.datasetapi.getDataSetByIdsUsingPOST(dsIds);
        const datasets = resDs.data.data!;
        // let teams = await teamapi.findTeamsByDsIds(dsIds);

        versions.forEach((version) => {
          // let team = teams.find(team => team.dsId === version.dataSetId);

          result.push({
            dsInfo: datasets.find((ds) => ds.id === version.dataSetId)!,
            vsInfo: version,
            // teamInfo: team ? team.teamVO : null,
            key: version.id!,
          });
        });
      }
    }

    return result;
  }

  async deliveryToRecipient(pkgId: string, userId: string, projectId: string) {
    const res = await this.archiveapi.assignArchive2RecipientsUsingPOST(
      pkgId,
      projectId,
      1,
      authService.getUserId(),
      [userId],
    );
    return res.data.data;
  }

  async getArchiveRecipients(pkgId: string, projectId: string) {
    const res = await this.archiveapi.findRecipients4ResouceUsingGET(
      pkgId,
      projectId,
      1,
      authService.getUserId()!,
    );
    return res.data.data;
  }

  async disableAssign(pkgId: string, projectId: string, recipientId: string) {
    const res = await this.archiveapi.disable4RecipientsUsingPUT(
      pkgId,
      projectId,
      1,
      authService.getUserId()!,
      [recipientId],
    );
    return res.data.data;
  }

  async enableAssign(pkgId: string, projectId: string, recipientId: string) {
    const res = await this.archiveapi.enable4RecipientsUsingPUT(
      pkgId,
      projectId,
      1,
      authService.getUserId()!,
      [recipientId],
    );
    return res.data.data;
  }
}
