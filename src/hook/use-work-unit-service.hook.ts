import { useState, useEffect, useCallback } from "react";
import { DataSetVO, VersionVO } from "api/generated/model";
import { workUnitService, versionService } from "service";
import useLoading from "hook/use-loading.hook";
import { message } from "antd";

export const useWorkUnitListByProjectId = (
  projectId?: string,
  status?: "draft" | "committed",
) => {
  const [workUnits, setWorkUnits] = useState<DataSetVO[]>([]);
  const refresh = useCallback(async () => {
    if (projectId) {
      try {
        let list = await workUnitService.listWorkUnitsByProjectId(
          projectId,
          status ?? "draft",
        );
        if (!status && list?.length > 0) {
          const commitWorkUnitIds = await workUnitService.loadCommitWorkUnitIds(
            list.map((unit) => unit.id!),
          );
          list = list.map((unit) => {
            const commitId =
              commitWorkUnitIds &&
              commitWorkUnitIds.find(
                (commitWorkUnit) => commitWorkUnit.draftDataSetId === unit.id,
              )?.committedDataSetId;
            return {
              ...unit,
              type: commitId ? "committedWorkunit" : unit.type,
              id: commitId || unit.id,
            };
          });
        }
        setWorkUnits(list);
      } catch (err) {
        console.error(err);
      }
    }
  }, [projectId, status]);
  const { loading } = useLoading(refresh, undefined, null);

  return { workUnits, refresh, loading };
};
export const useWorkUnitListByTeamId = (
  teamId: string,
  status?: "draft" | "committed",
) => {
  const [workUnits, setWorkUnits] = useState<DataSetVO[]>([]);
  const refresh = useCallback(async () => {
    try {
      const list = await workUnitService.listWorkUnitsByTeamId(
        teamId,
        status ?? "draft",
      );
      setWorkUnits(list);
    } catch (err) {
      message.error(err);
    }
  }, [teamId, status]);
  const { loading } = useLoading(refresh, undefined, null);

  return { workUnits, refresh, loading };
};
export const useVersionListByWorkUnits = (
  workUnit?: DataSetVO[] | string,
  status?: "draft" | "committed",
) => {
  const [versions, setVersions] = useState<VersionVO[]>([]);
  const workUnitIds: string[] =
    (workUnit &&
      (Array.isArray(workUnit)
        ? workUnit.map((unit) => unit.id!)
        : [workUnit])) ||
    [];
  const refresh = useCallback(async () => {
    try {
      if (workUnitIds.length > 0) {
        const list = await workUnitService.listVersionsByWorkUnitIds(
          workUnitIds,
          undefined,
          status || "draft",
        );
        setVersions(list);
      } else {
        setVersions([]);
      }
    } catch (err) {
      message.error(err);
    }
  }, [workUnitIds?.toString()]);
  const { loading } = useLoading(refresh, undefined, null);

  return { versions, refresh, loading };
};
export const useVersionListByIds = (versionIds: number[]) => {
  const [versions, setVersions] = useState<VersionVO[]>([]);
  const refresh = useCallback(async () => {
    if (versionIds?.length > 0) {
      try {
        const list = await versionService.listVersionsByIds(versionIds);
        setVersions(list ?? []);
      } catch (err) {
        message.error(err);
      }
    }
  }, [versionIds]);
  const { loading } = useLoading(refresh, undefined, null);
  return { versions, refresh, loading };
};
