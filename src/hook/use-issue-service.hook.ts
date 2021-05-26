import { useState, useEffect, useCallback } from "react";
import {
  issueService,
  workUnitService,
  userService,
  fileService,
} from "service";
import { IssueVO } from "api/generated/model";
import useLoading from "hook/use-loading.hook";
import projectPageState from "state/project.state";
import { message } from "antd";
import { cameraMapVersions } from "component/issue/IssueView";

function transIssue(issue?: IssueVO): IssueVO | undefined {
  if (issue?.camera) {
    const camera = JSON.parse(issue.camera).data
      ? JSON.parse(JSON.parse(issue.camera).data)
      : JSON.parse(issue.camera);
    const cameraMap =
      cameraMapVersions[camera.cameraVersion || cameraMapVersions.length - 1];
    const readValue = (field: string | string[]) =>
      typeof field === "string"
        ? camera[field]
        : field.reduce((value, key) => value?.[key], camera);
    return {
      ...issue,
      camera: JSON.stringify(
        cameraMap.reduce((result: any, item) => {
          const valueField = item.valueField || item.field;
          if (typeof valueField === "string") {
            return {
              ...result,
              [valueField]: readValue(item.field),
            };
          }
          valueField.reduce((value, key, index) => {
            if (!value[key] && index !== valueField.length - 1) {
              value[key] = {};
            } else if (valueField.length - 1 === index) {
              value[key] = readValue(item.field);
            }
            return value[key];
          }, result);
          return result;
        }, {}),
      ),
    };
  }
  return issue;
}
export const useIssueList = ({
  teamId,
  unitIds,
  type,
}: {
  teamId?: string;
  unitIds?: string[];
  type?: string;
}) => {
  const [issues, setIssues] = useState<IssueVO[]>([]);
  const issueSort = (list: IssueVO[]) =>
    list.sort((a, b) =>
      (a.updateTime || a.creationTime || "") >
      (b.updateTime || b.creationTime || "")
        ? -1
        : 1,
    );

  const getData = useCallback(async () => {
    try {
      let resultList: IssueVO[] = [];
      if (teamId && teamId !== "0" && teamId !== "undefined") {
        resultList = await issueService.listIssueByTeamId(teamId, type);
      } else if (unitIds && unitIds.length > 0) {
        resultList = await issueService.listIssueByDatasetIds(unitIds, type);
      }
      setIssues(resultList.map((issue) => transIssue(issue)!));
    } catch (err) {
      console.error(err);
    }
  }, [unitIds?.toString(), teamId, type]);
  const { loading } = useLoading(getData, undefined, null);
  return { issues, refresh: getData, loading };
};

export interface IssueVOEx extends IssueVO {
  ownerId?: string;
  ownerName?: string;
}
export const useIssueDetail = (issueId?: number) => {
  const [issue, setIssue] = useState<IssueVOEx>({});
  const getData = useCallback(async () => {
    if (issueId) {
      const issueDetail: IssueVOEx | undefined = await issueService
        .loadIssue(issueId)
        .catch((err) => message.error(err));
      const currentWorkUnit =
        issueDetail?.issueDatasets &&
        issueDetail.issueDatasets.find(
          (issueWorkUnit) => issueWorkUnit.isCurrent,
        );
      if (issueDetail && currentWorkUnit) {
        const workUnit = await workUnitService
          .loadWorkUnitById(currentWorkUnit.datasetId!)
          .catch((err) => message.error(err));
        if (workUnit?.ownerId) {
          const [owner] =
            (await userService
              .listUsersByids([workUnit?.ownerId])
              .catch((err) => message.error(err))) || [];
          if (owner) {
            issueDetail.ownerId = workUnit.ownerId;
            issueDetail.ownerName = owner.name;
          }
        }
      }
      setIssue(transIssue(issueDetail) || {});
    }
  }, [issueId]);
  const { loading } = useLoading(getData, undefined, null);
  return { issue, refresh: getData, loading };
};
export const useIssueImg = (path?: string) => {
  const [issueImg, setIssueImg] = useState<string | undefined>("");
  const getData = useCallback(async () => {
    if (
      path &&
      path.indexOf("http") !== 0 &&
      path.indexOf("data:image/png;") !== 0
    ) {
      fileService.getDownloadFileUrl(path).then((res) => {
        setIssueImg(res.fileUrlWithSAS);
      });
    } else {
      setIssueImg(path);
    }
  }, [path]);
  const { loading } = useLoading(getData, undefined, null);
  console.log(path, issueImg);
  return { issueImg, refresh: getData, loading };
};
