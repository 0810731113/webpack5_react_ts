import React, { useContext, useEffect } from "react";
import { Table, Button } from "component/Antd";
import { useRouteMatch, Link } from "react-router-dom";
import { ProjectTeamParams } from "model/route-params.model";
import WorkUnitList, {
  WorkUnitListProps,
  VersionStatus,
  RowData,
} from "component/WorkUnitList";
import { InfoCircleOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import Loading from "component/Loading";
import {
  ShareRecordVOStatusEnum,
  VersionVO,
  Team,
  ProjectVO,
} from "api/generated/model";
import { useImmer } from "use-immer";
import "./WorkUnitPage.scss";
import { useRecoilState } from "recoil";
import { TreeNode, transTeamWorkUnitTreeData } from "function/workUnit.func";
import projectPageState from "state/project.state";
import {
  useWorkUnitListByProjectId,
  useVersionListByWorkUnits,
} from "hook/use-work-unit-service.hook";
import { useQueryParams, StringParam, withDefault } from "use-query-params";
import { usePermissions } from "hook/use-permission.hook";
import { useShareRecords } from "hook/use-share-service.hook";
import { getErrorStatusType } from "function/version.func";
import { Tooltip, Space } from "antd";
import { defaultDateTimeFromString } from "function/date.func";
import { parseWorkUnitMetaInfo } from "function/bimface.func";
import { publishEvent } from "function/stats.func";
import Scrollbars from "react-custom-scrollbars";
import consts, { defaultScrollbarSettings } from "consts";
import WorkUnitPageSidebar from "./WorkUnitPageSidebar";

const { ENV } = consts;

interface WorkUnitPageProps {}
export interface WorkUnitPageState extends WorkUnitListProps {
  selectingUnits: boolean;
  folderName: string | null;
  nodes: TreeNode[] | null;
}

const versionComparatorButton = (
  versions: VersionVO[],
  from: string,
  project: ProjectVO | null,
  link?: boolean,
) => {
  const enabledVersions = versions?.filter((version) => {
    const metaInfo = parseWorkUnitMetaInfo(version.viewingInfo);
    const component = null;
    if (metaInfo.status === "failed" || metaInfo.status === "crash") {
      return false;
    }
    if (metaInfo.status === "processing") {
      return false;
    }
    if (
      metaInfo.status === "nodata" ||
      !metaInfo.status ||
      version.version === 0
    ) {
      return false;
    }
    return true;
  });

  const btnClicked = () => {
    publishEvent(`compareVersion`, ["团队协同", "版本对比"], {
      eventLevel: "P2",
      from,
    });
  };
  return (
    <Button
      ghost={!link}
      type={link ? "link" : "primary"}
      disabled={enabledVersions?.length < 2}
      style={{ flex: "none", width: 80 }}
    >
      <Link
        to={`/model-comparator?leftVersionId=${
          enabledVersions?.[0]?.id
        }&rightVersionId=${
          enabledVersions?.[1]?.id
        }&format=${"gac"}&workUnitId=${
          enabledVersions?.[0]?.dataSetId
        }&title=“${project?.name}” 模型对比`}
        target="_blank"
        onClick={btnClicked}
      >
        版本对比
      </Link>
    </Button>
  );
};

export default function WorkUnitPage(props: WorkUnitPageProps) {
  const {} = props;
  const {
    params: { projectId, teamId },
  } = useRouteMatch<ProjectTeamParams>();
  const [{ folderTeamId, workUnitId }] = useQueryParams({
    folderTeamId: withDefault(StringParam, undefined),
    workUnitId: withDefault(StringParam, undefined),
  });
  const [
    { workUnits, selectingUnits, folderName, versions, nodes },
    updateState,
  ] = useImmer<WorkUnitPageState>({
    workUnits: [],
    selectingUnits: false,
    folderName: null,
    versions: {},
    nodes: null,
    folderId: "",
    onReload: () => {},
  });
  const [{ teams, project }] = useRecoilState(projectPageState);
  const { workUnits: allWorkUnits, loading } = useWorkUnitListByProjectId(
    projectId,
  );
  const { permissions, loading: loadingPermissions } = usePermissions(
    teamId,
    "TrustBy",
  );
  const {
    versions: allVersions,
    loading: loadingVersions,
  } = useVersionListByWorkUnits(allWorkUnits, "committed");
  const { records: consumedData } = useShareRecords({
    consumeId: teamId,
    status: [ShareRecordVOStatusEnum.Consumed],
  });

  useEffect(() => {
    (async () => {
      if (!loading) {
        updateState((draft) => {
          draft.nodes = transTeamWorkUnitTreeData({
            teams,
            workUnits: allWorkUnits,
          });
        });
      }
    })();
  }, [teams, allWorkUnits, loading]);
  useEffect(() => {
    if (loading || loadingVersions) {
      return;
    }
    if (workUnitId) {
      updateState((draft) => {
        draft.workUnits = allWorkUnits.filter(
          (workUnit) => workUnit.id === workUnitId,
        );
        const unit = draft.workUnits[0];
        draft.versions = {
          [workUnitId]: allVersions.filter(
            (version) =>
              version.dataSetId === workUnitId &&
              version.version &&
              (unit?.teamId !== teamId &&
              !permissions.some(
                (permission) => permission.teamId === unit?.teamId,
              )
                ? consumedData?.some((data) =>
                    data.contents?.some((content) => version.id === content.id),
                  )
                : true),
          ),
        };
      });
    } else {
      updateState((draft) => {
        const selectWorkUnits = (folderTeamId
          ? allWorkUnits.filter((unit) => unit.teamId === folderTeamId)
          : allWorkUnits
        ).map((unit) => ({
          ...unit,
          disabled:
            unit.type === "workunit" ||
            (unit.teamId !== teamId &&
              !permissions.some(
                (permission) => permission.teamId === unit.teamId,
              ) &&
              !consumedData.some((data) =>
                data.contents?.some((content) => content.dataSetId === unit.id),
              )),
        }));
        draft.workUnits = selectWorkUnits;
        const initVersions: { [workUnitId: string]: VersionVO[] } = {};
        draft.versions = selectWorkUnits.reduce(
          (result, unit) =>
            unit.disabled
              ? result
              : {
                  ...result,
                  [unit.id!]: allVersions.filter(
                    (version) =>
                      version.dataSetId === unit.id &&
                      (unit.teamId !== teamId &&
                      !permissions.some(
                        (permission) => permission.teamId === unit.teamId,
                      )
                        ? consumedData?.some((data) =>
                            data.contents?.some(
                              (content) => version.id === content.id,
                            ),
                          )
                        : true),
                  ),
                },
          initVersions,
        );
      });
    }
  }, [
    folderTeamId,
    workUnitId,
    allWorkUnits,
    allVersions,
    loading,
    loadingVersions,
    consumedData,
  ]);
  if (loading || loadingVersions) {
    return (
      <div className="data-loading">
        <Loading absolute size={48} />
      </div>
    );
  }
  const fromRender = (value: string, record: RowData) => {
    if (record.disabled) {
      return "-";
    }
    if (record.teamId === teamId) {
      return "提交";
    }
    if (permissions.some((permission) => permission.teamId === record.teamId)) {
      return "已放权";
    }
    return "已收资";
  };
  return (
    <div className="workunit-page">
      <WorkUnitPageSidebar
        nodes={nodes}
        loading={loadingPermissions}
        permissions={permissions}
        consumedData={consumedData}
      />

      <div className="workunit-content">
        {workUnitId ? (
          versions[workUnitId] && (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {versionComparatorButton(
                versions[workUnitId],
                "单工作单元版本列表",
                project,
              )}
              <Scrollbars {...defaultScrollbarSettings}>
                <Table
                  style={{ marginTop: 16 }}
                  pagination={false}
                  dataSource={versions[workUnitId]}
                  columns={[
                    {
                      title: "版本",
                      dataIndex: "displayVersion",
                      key: "displayVersion",
                      // render: (text, record) => `${text}`,
                    },
                    // {
                    //   title: (
                    //     <span className="has-info-icon">
                    //       类型
                    //       <Tooltip
                    //         title="workunit是广联达设计标准格式"
                    //         trigger="hover"
                    //         placement="bottom"
                    //       >
                    //         <InfoCircleOutlined />
                    //       </Tooltip>
                    //     </span>
                    //   ),
                    //   dataIndex: "type",
                    //   key: "type",
                    //   width: 80,
                    //   render: (value) =>
                    //     workUnits[0]?.type &&
                    //     ["workunit", "committedWorkunit"].includes(
                    //       workUnits[0]?.type,
                    //     )
                    //       ? "workunit"
                    //       : workUnits[0]?.type,
                    // },
                    {
                      title: "版本来源",
                      dataIndex: "viewType",
                      key: "viewType",
                      render: () =>
                        fromRender("", {
                          ...(workUnits[0] || {}),
                          key: workUnitId,
                          versions: [],
                        }),
                    },
                    {
                      title: "日期",
                      dataIndex: "creationTime",
                      key: "creationTime",
                      render: (text, record) =>
                        record.disabled
                          ? "-"
                          : (text && text.substr(0, 10)) ||
                            (record.selectedVersion &&
                              record.selectedVersion.creationTime &&
                              defaultDateTimeFromString(
                                record.selectedVersion.creationTime,
                              )),
                    },
                    {
                      title: "操作",
                      dataIndex: "displayVersion",
                      key: "displayVersion",
                      render: (text, record) => {
                        const errorStatus = getErrorStatusType(record);
                        return errorStatus ? (
                          <span className={errorStatus.className}>
                            {text}{" "}
                            {errorStatus.label && `(${errorStatus.label})`}
                          </span>
                        ) : (
                          <Link
                            to={`/model-viewer?versionIdList=${record.id}&format=${workUnits[0]?.type}&title=“${project?.name}”模型查看`}
                            target="_blank"
                          >
                            查看
                          </Link>
                        );
                      },
                    },
                  ]}
                />
              </Scrollbars>
            </div>
          )
        ) : (
          <div style={{ position: "relative", height: "100%" }}>
            <WorkUnitList
              workUnits={workUnits}
              versions={versions}
              mode="collaboration"
              folderId=""
              extraActions={(record) =>
                versionComparatorButton(
                  record.versions,
                  "多工作单元列表",
                  project,
                  true,
                )
              }
              onStandardColumns={(columns) => {
                columns.splice(0, 1, {
                  title: "工作单元",
                  dataIndex: "name",
                  key: "name",
                  render(value, record) {
                    return (
                      <span style={{ opacity: record.disabled ? 0.5 : 1 }}>
                        {value}
                      </span>
                    );
                  },
                });
                columns.splice(3, 0, {
                  title: "版本来源",
                  dataIndex: "id",
                  key: "id",
                  render: fromRender,
                });
              }}
              onReload={() => console.log("")}
            />
            <Space style={{ position: "absolute", right: 0, top: 0 }}>
              {`${workUnits?.length}个工作单元`}
              <Tooltip placement="bottom" title="前往“协同设置”，管理工作单元">
                <QuestionCircleOutlined />
              </Tooltip>
            </Space>
          </div>
        )}
      </div>
    </div>
  );
}
