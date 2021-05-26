import { authService } from "service";
import { DataSetApi, VersionApi, IntegrateApi } from "api";
import { AxiosStatic } from "axios";

import {
  DataSetVO,
  VersionVO,
  Resource,
  IntegratePackageCreation,
  IntegrateVersionVO,
} from "api/generated/model";

export class IntegratePackagesService {
  integrateapi: IntegrateApi;

  versionapi: VersionApi;

  datasetapi: DataSetApi;

  constructor(baseUrl: string, axios: AxiosStatic) {
    this.integrateapi = new IntegrateApi({}, baseUrl, axios);
    this.versionapi = new VersionApi({}, baseUrl, axios);
    this.datasetapi = new DataSetApi({}, baseUrl, axios);
  }

  async createIntegreate(projectId: string, name: string, description: string) {
    const body: IntegratePackageCreation = {
      description,
      name,
      projectId,
      integratePackageType: 0,
    };
    const res = await this.integrateapi.createIntegratePackageUsingPOST(
      authService.getUserId()!,
      body,
    );
    return res.data.data;
  }

  async deleteIntegrate(intId: string) {
    const response = await this.integrateapi.deleteIntegrateVersionByPackageVersionUsingDELETE(
      intId,
    );
    return response.data;
  }

  async getAllIntegratesVersions(projectId: string) {
    const response = await this.integrateapi.getIntegratePackagesByProjectIdUsingGET(
      projectId,
    );

    const packages = response.data.data ?? [];
    return packages;
  }

  async batchLoadIntegratesVersions(packageIds: string[]) {
    const response = await this.integrateapi.getIntegrateVersionsUsingPOST(
      packageIds,
    );
    const pkgVersions = response.data.data ?? [];
    return pkgVersions.reduce<{ [pkgId: string]: IntegrateVersionVO[] }>(
      (pre, current) => {
        pre[current.packageId!] = pre[current.packageId!] || [];
        pre[current.packageId!].push(current);
        return pre;
      },
      {},
    );
  }

  // async getArchiveByPackageId(packageId: string) {
  //   let response = await this.archiveapi.getArchivePackageUsingGET(packageId);
  //   let pkg = response.data.data;
  //   return pkg
  // }

  // async getArchiveInfoByPackageId(packageId: string) {
  //   let response = await this.archiveapi.getArchivePackageUsingGET(packageId);
  //   let pkg = response.data.data;
  //   let res = await this.archiveapi.getArchiveVersionsByPackageIdUsingGET(
  //     packageId,
  //   );
  //   let versions = res.data.data;
  //   versions?.sort((a, b) => (b.version ?? 0) - (a.version ?? 0));
  //   return { package: pkg!, versions: versions! };
  // }

  async postIntegrateResources(packageId: string, versionIds: number[]) {
    const response = await this.integrateapi.addResourcesToPackageUsingPOST1(
      packageId,
      authService.getUserId()!,
      versionIds,
    );

    return response.data;
  }

  // async getPackageVersionIds(packageId: string, versionId: number) {
  //   let resp = await this.archiveapi.getArchiveVersionByPackageVersionUsingGET(
  //     packageId,
  //     versionId,
  //   );

  //   let obj = resp.data.data;

  //   if (obj && obj.content) {
  //     return obj.content
  //       .filter((record) => record.type === "Version")
  //       .map((record) => parseInt(record.resourceId!));
  //   } else {
  //     return [];
  //   }
  // }

  // async getPackageVersionInfo(packageId: string, versionId: number) {
  //   const result: PackageVersionInfo[] = [];

  //   if (packageId && versionId) {
  //     let versionIds = await this.getPackageVersionIds(packageId, versionId);
  //     if (versionIds && versionIds.length > 0) {
  //       let resVer = await this.versionapi.getVersionsByIdsUsingPOST(
  //         versionIds,
  //       );
  //       let versions = resVer.data.data!;

  //       let dsIds = versions.map((version) => version.dataSetId!);
  //       let resDs = await this.datasetapi.getDataSetsByIdsUsingPOST(dsIds);
  //       let datasets = resDs.data.data!;
  //       //let teams = await teamapi.findTeamsByDsIds(dsIds);

  //       versions.forEach((version) => {
  //         //let team = teams.find(team => team.dsId === version.dataSetId);

  //         result.push({
  //           dsInfo: datasets.find((ds) => ds.id === version.dataSetId)!,
  //           vsInfo: version,
  //           //teamInfo: team ? team.teamVO : null,
  //           key: version.id!,
  //         });
  //       });
  //     }
  //   }

  //   return result;
  // }
}
