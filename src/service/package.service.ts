import { ShareApi, UserApi, DataSetApi, VersionApi } from "api";
import {
  ConsumeResponse,
  ShareRecordStatusEnum,
  ShareRecordVOStatusEnum,
  ShareRecord,
  DataSet,
  Version,
  VersionVO,
  ShareRecordUpdate,
  SharePackageVO,
  ShareRequest,
} from "api/generated/model";
import { AxiosStatic } from "axios";

export interface ShareRecordEx extends ShareRecord {
  shareUserName?: string;
  consumeUserName?: string;
}
export interface DataSetEx extends DataSet {
  selectedVersion?: Version | VersionVO;
  versions?: (Version | VersionVO)[];
}

export class PackageService {
  packageApi: ShareApi;

  userApi: UserApi;

  dataSetApi: DataSetApi;

  versionApi: VersionApi;

  constructor(baseUrl: string, axios: AxiosStatic) {
    this.packageApi = new ShareApi({}, baseUrl, axios);
    this.userApi = new UserApi({}, baseUrl, axios);
    this.dataSetApi = new DataSetApi({}, baseUrl, axios);
    this.versionApi = new VersionApi({}, baseUrl, axios);
  }

  async listSharedPackages(consumedId: string, shareId: string) {
    const response = await this.packageApi.getShareRecordsUsingPOST({
      consumedId,
      shareId,
      status: ShareRecordStatusEnum.Consumed,
    });

    return response.data.data;
  }

  async listPackageWorkUnits(packageIdList: string[]) {
    const response = await this.packageApi.getShareContentsUsingPOST(
      packageIdList,
    );
    const result = response.data.data as ConsumeResponse[];
    const versions = result.reduce<{ [workUnitId: string]: Version[] }>(
      (pre, { dataSet, versions: list }) => {
        pre[dataSet!.id!] = list as Version[];
        return pre;
      },
      {},
    );
    return {
      workUnits: result.map((item) => item.dataSet!),
      versions,
    };
  }

  async listSharePackages(teamId: string, status?: "Temporary" | "Shared") {
    const response = await this.packageApi.getSharePackagesUsingGET(
      teamId,
      status,
    );

    const packages = response.data.data || [];
    const shareUserIds = packages.map(
      (item: SharePackageVO) => item.shareUserId ?? "",
    );
    const users = (await this.userApi.getUsersByIdsUsingPOST(shareUserIds)).data
      .data;
    return packages.map((item: SharePackageVO) => {
      const record = (item.shareRecords && item.shareRecords[0]) || {};
      const shareUser =
        (users && users.find((user) => user.id === item.shareUserId)) || {};
      return {
        ...record,
        ...item,
        shareUserName: shareUser.name,
        status:
          record.status === ShareRecordVOStatusEnum.Temporary
            ? ShareRecordVOStatusEnum.Temporary
            : ShareRecordVOStatusEnum.Shared,
      };
    });
  }

  async loadPackage(packageId: string) {
    let result: [ShareRecordEx?, DataSetEx[]?] = [];
    if (packageId) {
      const ShareRecordsResponse = await this.packageApi.getShareRecordsUsingPOST(
        { id: packageId },
      );
      const record: ShareRecordEx = (ShareRecordsResponse.data.data || [])[0];
      if (record?.id) {
        const users = (
          await this.userApi.getUsersByIdsUsingPOST(
            [record.shareUserId ?? "", record.consumeUserId ?? ""].filter(
              Boolean,
            ),
          )
        ).data.data;
        const shareUser =
          (users && users.find((user) => user.id === record.shareUserId)) || {};
        const consumeUser =
          (users && users.find((user) => user.id === record.consumeUserId)) ||
          {};
        record.shareUserName = shareUser.name;
        record.consumeUserName = consumeUser.name;
      }
      const response = await this.packageApi.getShareContentsUsingPOST([
        packageId,
      ]);
      const list = response.data.data || [];
      // const promiseList = list.map(
      //   async (item) =>
      //     await this.dataSetApi.getDataSetVersionsUsingGET(item.dataSet?.id!),
      // );
      // const versionsList = await Promise.all(promiseList);
      const versionsList = (
        await this.versionApi.getVersionsByDataSetIdsMVDUsingPOST(
          list.map((item) => item.dataSet?.id!),
        )
      ).data.data as VersionVO[];
      const newData = list.map((item, index) => {
        versionsList?.sort((a, b) => (b?.version ?? 0) - (a?.version ?? 0));
        return {
          ...item.dataSet,
          versions: item.versions,
          selectedVersion:
            (item.versions && item.versions[0]) ||
            versionsList.filter((v) => v.dataSetId === item.dataSet?.id)?.[0],
        };
      });
      result = [record, newData];
    }
    return result;
  }

  async updatePackage(record: ShareRecordUpdate) {
    const response = await this.packageApi.updateShareRecordUsingPUT(record);
    return response.data;
  }

  async acceptPackage(shareRecordId: string, xGdcUserid: string) {
    const response = await this.packageApi.acceptShareDataUsingPOST(
      shareRecordId,
      xGdcUserid,
    );
    return response.data;
  }

  async sharePackage(shareRecordId: string[], xGdcUserid: string) {
    const response = await this.packageApi.shareDatasUsingPUT(
      xGdcUserid,
      shareRecordId,
    );
    return response.data;
  }

  async createPackage(shareRequest: ShareRequest, xGdcUserid: string) {
    if (shareRequest.consumedIds?.length) {
      const response = await this.packageApi.createShareDataUsingPUT(
        xGdcUserid,
        shareRequest,
      );
      return response.data;
    }
    // eslint-disable-next-line prefer-promise-reject-errors
    return Promise.reject("此项目就一个团队，无法进行分享！！");
  }

  async resolvePackageListWorkUnits(
    consumeTeamId: string,
    shareTeamId: string,
  ) {
    const packages = await this.listSharedPackages(consumeTeamId, shareTeamId);
    const result = await this.listPackageWorkUnits(
      packages!.map((pkg) => pkg!.id!),
    );
    return result;
  }

  async listConsumeRecords(
    consumedId: string,
    status?: ShareRecordVOStatusEnum[],
    consumeUserId?: string,
  ) {
    const response = await this.packageApi.getConsumeRecordsUsingGET(
      consumeUserId,
      consumedId,
      status,
    );
    return response.data.data ?? [];
  }
}
