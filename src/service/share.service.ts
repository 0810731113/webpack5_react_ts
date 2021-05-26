import { ShareApi, UserApi, DataSetApi } from "api";
import {
  ShareRecordVOStatusEnum,
  ShareRecord,
  DataSet,
  Version,
  VersionVO,
  ShareRecordUpdate,
  SharePackageVO,
  ShareRequest,
} from "api/generated/model";

export interface ShareRecordEx extends ShareRecord {
  shareUserName?: string;
  consumeUserName?: string;
}
export interface DataSetEx extends DataSet {
  selectedVersion?: Version | VersionVO;
  versions?: Version[];
}

export class ShareService {
  shareApi: ShareApi;

  userApi: UserApi;

  dataSetApi: DataSetApi;

  constructor(baseUrl: string) {
    this.shareApi = new ShareApi({ basePath: baseUrl });
    this.userApi = new UserApi({ basePath: baseUrl });
    this.dataSetApi = new DataSetApi({ basePath: baseUrl });
  }

  async listSharePackages(teamId: string, status?: "Temporary" | "Shared") {
    const response = await this.shareApi.getSharePackagesUsingGET(
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
      const ShareRecordsResponse = await this.shareApi.getShareRecordsUsingPOST(
        { id: packageId },
      );
      const record: ShareRecordEx = (ShareRecordsResponse.data.data || [])[0];
      if (record.id) {
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
      const response = await this.shareApi.getShareContentsUsingPOST([
        packageId,
      ]);
      const list = response.data.data || [];
      const promiseList = list.map(
        async (item) =>
          await this.dataSetApi.getDataSetVersionsUsingGET(
            item.dataSet?.id || "",
          ),
      );
      const versionsList = await Promise.all(promiseList);
      const newData = list.map((item, index) => {
        versionsList[index].data?.sort(
          (a, b) => (b?.version ?? 0) - (a?.version ?? 0),
        );
        return {
          ...item.dataSet,
          versions: item.versions,
          selectedVersion:
            (item.versions && item.versions[0]) || versionsList[index].data[0],
        };
      });
      result = [record, newData];
    }
    return result;
  }

  async updatePackage(record: ShareRecordUpdate) {
    const response = await this.shareApi.updateShareRecordUsingPUT(record);
    return response.data;
  }

  async acceptPackage(shareRecordId: string, xGdcUserid: string) {
    const response = await this.shareApi.acceptShareDataUsingPOST(
      shareRecordId,
      xGdcUserid,
    );
    return response.data;
  }

  async sharePackage(shareRecordId: string[], xGdcUserid: string) {
    const response = await this.shareApi.shareDatasUsingPUT(
      xGdcUserid,
      shareRecordId,
    );
    return response.data;
  }

  async createPackage(shareRequest: ShareRequest, xGdcUserid: string) {
    if (shareRequest.consumedIds?.length) {
      const response = await this.shareApi.createShareDataUsingPUT(
        xGdcUserid,
        shareRequest,
      );
      return response.data;
    }
    return Promise.reject("此项目就一个团队，无法进行分享！！");
  }
}
