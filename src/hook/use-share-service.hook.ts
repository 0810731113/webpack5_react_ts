import { useState, useEffect, useCallback } from "react";
import { packageService } from "service";
import { ShareRecordEx, DataSetEx } from "service/package.service";
import useLoading from "hook/use-loading.hook";
import {
  SharePackageVO,
  ShareRecord,
  ShareRecordVOStatusEnum,
  ShareRecordVO,
} from "api/generated/model";
import { useRecoilState } from "recoil";
import projectPageState, { teamByIdSelector } from "state/project.state";
import { useRequest } from "@umijs/hooks";
import { message } from "antd";

interface userSharePackagesParam {
  teamId: string;
  status?: "Temporary" | "Shared";
}
// @ts-ignore
export interface SharePackageEx extends ShareRecord, SharePackageVO {
  shareUserName?: string;
  status?: ShareRecordVOStatusEnum;
}
export const useSharePackages: (
  param: userSharePackagesParam,
) => [SharePackageEx[] | undefined, boolean, () => Promise<void>] = ({
  teamId,
  status,
}: userSharePackagesParam) => {
  const [sharePackages, setSharePackages] = useState<
    SharePackageEx[] | undefined
  >([]);
  const [loading, setLoading] = useState<boolean>(false);
  const getPackages = async () => {
    const packages = await packageService.listSharePackages(teamId, status);
    setLoading(false);
    setSharePackages(packages || []);
  };
  useEffect(() => {
    if (teamId && teamId !== "0") {
      setLoading(true);
      getPackages();
    }
  }, [teamId, status]);

  return [sharePackages, loading, getPackages];
};

export const useInformation = (packageIds: string) => {
  // const getData = useCallback(async () => {
  //   if (packageIds) {
  //     const [record, content] = await packageService.loadPackage(
  //       packageIds.split(",")[0],
  //     );
  //     return { info: record || {}, shareContent: content || [] };
  //     // setInfo(record || {});
  //     // setShareContent(content || []);
  //   }
  //   return { info: {}, shareContent: [] };
  // }, [packageIds]);
  // const { loading, data } = useRequest<{
  //   info: ShareRecordEx;
  //   shareContent: DataSetEx[];
  // }>(getData, undefined, { info: {}, shareContent: [] });

  const { data, loading, run } = useRequest(
    async () => {
      if (packageIds) {
        const [record, content] = await packageService.loadPackage(
          packageIds.split(",")[0],
        );
        return { info: record || {}, shareContent: content || [] };
        // setInfo(record || {});
        // setShareContent(content || []);
      }
      return { info: {}, shareContent: [] };
    },
    {
      manual: true,
    },
  );
  useEffect(() => {
    run();
  }, [packageIds]);

  const { info = {}, shareContent = [] } = data || {};
  return { info, shareContent, refresh: run, loading };
};
interface useShareRecordsParam {
  consumeUserId?: string;
  consumeId: string;
  status?: ShareRecordVOStatusEnum[];
}
export const useShareRecordsWithoutUserName = ({
  consumeUserId,
  consumeId,
  status = [ShareRecordVOStatusEnum.Consumed, ShareRecordVOStatusEnum.Shared],
}: useShareRecordsParam) => {
  const { data, loading, run } = useRequest(
    () => {
      try {
        return packageService.listConsumeRecords(
          consumeId,
          status,
          consumeUserId,
        );
      } catch (err) {
        message.error(err);
      }
    },
    {
      manual: true,
    },
  );

  useEffect(() => {
    if (consumeId && consumeId !== "0") {
      run();
    }
  }, [consumeUserId, consumeId, status?.toString()]);

  return { records: data, loading, refresh: run };
};
export const useShareRecords = ({
  consumeUserId,
  consumeId,
  status = [ShareRecordVOStatusEnum.Consumed, ShareRecordVOStatusEnum.Shared],
}: useShareRecordsParam) => {
  const [{ users }] = useRecoilState(projectPageState);
  const {
    records: originalRecords,
    loading: originalLoading,
  } = useShareRecordsWithoutUserName({ consumeUserId, consumeId, status });
  const [records, setRecords] = useState<ShareRecordVO[]>([]);
  useEffect(() => {
    setRecords(
      originalRecords?.map((item) => {
        const shareUser =
          users?.find((user) => user.id === item.shareUserId) || {};
        const consumeUser =
          (users && users.find((user) => user.id === item.consumeUserId)) || {};
        return {
          ...item,
          shareUserName: shareUser.name,
          consumeUserName: consumeUser.name,
        };
      }) ?? [],
    );
  }, [originalRecords, users]);

  return { records, loading: originalLoading };
};
