/* eslint-disable @typescript-eslint/no-use-before-define */
import {
  Button,
  Divider,
  Empty,
  notification,
  Select,
  Space,
  Tag,
  Tooltip,
  Modal,
  message,
  Layout,
} from "antd";
import { InfoCircleFilled, InfoCircleOutlined } from "@ant-design/icons";
import Table, { ColumnType } from "antd/lib/table";
import { TableRowSelection } from "antd/lib/table/interface";
import { DataSetVO, ProjectVO, VersionVO } from "api/generated/model";
import {
  isViewableFormat,
  // isViewableVersion,
  parseWorkUnitMetaInfo,
} from "function/bimface.func";
import { clone, first, orderBy, size, runInContext } from "lodash";
import moment from "moment";
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { fileService, workUnitService } from "service";
import { useImmer } from "use-immer";
import "./WorkUnitList.scss";
import { isVersionViewable } from "function/version.func";

import { defaultDateTimeFromString } from "function/date.func";
import { useRecoilValue, useRecoilState } from "recoil";
import projectPageState from "state/project.state";
import ProjectTeamName from "page/ProjectPage/_components/ProjectTeamName";
import Scrollbars from "react-custom-scrollbars";
import consts, { defaultScrollbarSettings } from "consts";
import { publishEvent } from "function/stats.func";
import { ResourcePermissionResourceEnum } from "api-authorization/generated/model";
import { CheckPermission } from "./CheckPermission/CheckPermission";
import { SelectVersions } from "./Version/SelectVersions";
import { TooltipWrapper } from "./wrapper/TooltipWrapper";

export type RowData = DataSetVO & {
  key: string;
  versions: VersionVO[];
  disabled?: boolean;
};
export interface WorkUnitListProps {
  isDocument?: boolean;
  folderId?: string;
  disableToolbar?: boolean;
  mode?: "default" | "collaboration" | "draft" | "integrate";
  workUnits: DataSetVO[];
  versions: { [workUnitId: string]: VersionVO[] };
  extraActions?: (
    workUnit: RowData,
    version?: VersionVO,
    isMaxVersion?: boolean,
  ) => React.ReactNode;
  onReload: () => void;
  onStandardColumns?: (columns: ColumnType<RowData>[]) => void;
  setCheckedVersionIds?: (versionIds: number[]) => void;
}

export interface State {
  selectingUnits: boolean;
  selectedWorkUnitIds: React.Key[];
  workUnitMap: { [workUnitId: string]: DataSetVO };
  selectedVersions: { [workUnitId: string]: VersionVO | null };
  columns: ColumnType<RowData>[];
}

export default function WorkUnitList(props: WorkUnitListProps) {
  const {
    isDocument,
    workUnits,
    versions,
    mode,
    disableToolbar,
    setCheckedVersionIds,
    extraActions,
    onReload,
    onStandardColumns,
  } = props;
  useEffect(() => {
    toggleSelecting(false);
  }, [workUnits]);
  const [
    {
      selectingUnits,
      selectedVersions,
      selectedWorkUnitIds,
      workUnitMap,
      columns,
    },
    updateState,
  ] = useImmer<State>({
    selectingUnits: false,
    selectedVersions: {},
    selectedWorkUnitIds: [],
    columns: [],
    workUnitMap: {},
  });
  const [{ teams, currentUser, project }] = useRecoilState(projectPageState);

  useEffect(() => {
    updateState((draft) => {
      const tcolumns: ColumnType<RowData>[] = [
        {
          title: "工作单元名称",
          dataIndex: "name",
          key: "name",
          // width: 200,
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
        //     ["workunit", "committedWorkunit"].includes(value)
        //       ? "workunit"
        //       : value,
        // },
        {
          title:
            mode !== "draft" ? (
              "版本"
            ) : (
              <span className="has-info-icon">
                版本
                <Tooltip
                  title="在广联达建筑设计、广联达结构设计、广联达机电设计软件上进行“保存”或“提交”操作后将产生版本，目前仅支持删除“保存”产生的版本"
                  trigger="hover"
                  placement="top"
                >
                  <InfoCircleOutlined
                    style={{ color: "rgba(0, 0, 0, 0.85)" }}
                  />
                </Tooltip>
              </span>
            ),
          dataIndex: "versions",
          key: "versions",
          className: "versions",
          width: 105,
          render(value, record) {
            if (record.disabled) {
              return "-";
            }
            // const isDraft = mode === "draft";
            // if (isDraft) {
            //   return (
            //     <PopupVersions
            //       versions={versions[record.id!]}
            //       onVersionSelected={(version) => {
            //         updateState((draft) => {
            //           draft.selectedVersions[
            //             version?.dataSetId ?? ""
            //           ] = version;
            //         });
            //       }}
            //       operationRender={(version: VersionVO) => (
            //         <>
            //           <VersionStatus
            //             version={version}
            //             workUnitType={record.type}
            //           />

            //           <RestoreButton
            //             version={version}
            //             tipVersion={record.tipVersion ?? 0}
            //             workUnitId={record.id}
            //             onReload={onReload}
            //           />
            //         </>
            //       )}
            //     />
            //   );
            // } else {
            // }
            return (
              <SelectVersions
                workUnitType={record.type}
                versions={versions[record.id!]}
                onVersionSelected={(version) => {
                  updateState((newDraft) => {
                    newDraft.selectedVersions[version?.dataSetId ?? ""] =
                      version;
                  });
                }}
              />
            );
          },
        },
        {
          title: "团队",
          filters: teams.map((team) => ({
            text: team.name,
            value: team.id!,
          })),
          onFilter: (value, record) => record.teamId === value,
          render(value, record) {
            return <ProjectTeamName id={record.teamId!} />;
          },
        },
        {
          title: "日期",
          dataIndex: "datetime",
          width: 175,
          render(value, record) {
            const version = selectedVersions[record.id!];
            return (
              <span>{defaultDateTimeFromString(version?.creationTime)}</span>
            );
          },
        },
        {
          title: "操作",
          dataIndex: "id",
          key: "id",
          // align: "right",
          render(value, record) {
            if (record.disabled) {
              return "-";
            }
            const version = selectedVersions[value!];
            if (!version) return null;
            if (version && version.verifyStatus === "illegal") {
              return (
                <Tooltip
                  trigger="hover"
                  mouseEnterDelay={0.5}
                  placement="bottom"
                  title="非常抱歉，该版本数据似乎出现了问题，目前无法继续使用，请选择历史版本恢复"
                >
                  <InfoCircleFilled
                    style={{ color: "#faad14", fontSize: 14 }}
                  />
                </Tooltip>
              );
            }

            const maxVersion = versions[record.id!]?.reduce((prev, cur) =>
              (prev.version ?? 0) > (cur.version ?? -1) ? prev : cur,
            );

            return (
              <>
                <VersionStatus
                  version={version}
                  workUnitType={record.type}
                  project={project}
                  mode={mode}
                  isDocument={isDocument}
                />

                {extraActions?.(record, version, maxVersion?.id === version.id)}
              </>
            );
          },
        },
      ];
      onStandardColumns?.(tcolumns);
      draft.columns = tcolumns as any;
      workUnits.forEach((wu) => {
        draft.workUnitMap[wu.id!] = wu;
      });
    });
  }, [workUnits, versions, selectedVersions]);

  useEffect(() => {
    if (mode === "integrate") {
      toggleSelecting(true);
    }
  }, []);

  useEffect(() => {
    if (setCheckedVersionIds) {
      const checkedVersions = getCheckedVersions();
      setCheckedVersionIds(
        checkedVersions
          .filter((version) => isVersionViewable(version))
          .map((v) => v.id!),
      );
    }
  }, [selectedWorkUnitIds, selectedVersions]);

  if (size(workUnits) === 0) {
    return (
      <div>
        <Empty
          description={
            <div>
              <Space direction="vertical">
                <div>工作单元为空</div>
              </Space>
            </div>
          }
        />
      </div>
    );
  }

  function toggleSelecting(visible?: boolean) {
    updateState((draft) => {
      if (draft.selectingUnits) {
        draft.selectedWorkUnitIds = [];
      }
      draft.selectingUnits = visible ?? !draft.selectingUnits;
    });
  }

  function getCheckedVersions(isAll?: boolean) {
    if (!workUnits?.length || (!isAll && size(selectedWorkUnitIds) === 0))
      return [];

    if (isAll) {
      return workUnits
        .filter((workUnit) => !isLineDisabled(workUnit as RowData))
        .map((workUnit) => workUnit.id!)
        .map((workUnitId) => selectedVersions[workUnitId]!);
    }
    return selectedWorkUnitIds.map(
      (workUnitId) => selectedVersions[workUnitId]!,
    );
  }

  function combinedViewerUrl(isAll?: boolean) {
    const combinedVersions = getCheckedVersions(isAll);
    if (combinedVersions.length === 0) return "";
    const workUnit = workUnitMap[combinedVersions[0]?.dataSetId!];
    return `/model-viewer?versionIdList=${combinedVersions
      .map((v) => v?.id)
      .join(",")}&format=${workUnit?.type}&title=“${project?.name}”模型查看`;
  }

  const isLineDisabled = (record: RowData) => {
    const version = selectedVersions[record.id!];
    return (
      record.disabled ||
      !isViewableFormat(record.type) ||
      //! isViewableVersion(version) ||
      !isVersionViewable(version)
    );
  };

  const rowSelection: TableRowSelection<RowData> | undefined = selectingUnits
    ? {
        type: "checkbox",
        selectedRowKeys: selectedWorkUnitIds,
        getCheckboxProps(record) {
          return {
            disabled: isLineDisabled(record),
          };
        },
        onChange(selectedRowKeys, selectedRows) {
          if (selectedRows.some((row) => row.type !== selectedRows[0].type)) {
            notification.warn({
              message: "只能整合查看同一类型的工作单元",
            });
            return;
          }
          updateState((draft) => {
            draft.selectedWorkUnitIds = selectedRowKeys;
          });
        },
      }
    : undefined;

  return (
    <div className="work-unit-list">
      {!disableToolbar && (
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          {selectingUnits && (
            <Space>
              {`整合查看的工作单元：${size(selectedWorkUnitIds)}`}
              <div style={{ position: "relative" }}>
                <Button
                  type="primary"
                  disabled={size(selectedWorkUnitIds) === 0}
                  onClick={() => {
                    if (
                      ["draft", "collaboration"].includes(
                        mode?.toString() || "",
                      )
                    ) {
                      let modules: string[] = [];
                      switch (mode) {
                        case "draft":
                          modules = ["个人设计"];
                          break;
                        case "collaboration":
                          modules = ["团队协同", "实时协同"];
                          break;
                        default:
                          modules = [];
                      }
                      publishEvent(`viewWorkUnitInfo`, modules, {
                        eventLevel: "P1",
                        viewType: "整合查看",
                        from: mode === "draft" ? "个人设计" : "团队协同",
                      });
                    }
                  }}
                >
                  <Link
                    to={combinedViewerUrl()}
                    target="_blank"
                    onClick={() => {
                      updateState((draft) => {
                        draft.selectedWorkUnitIds = [];
                        draft.selectingUnits = false;
                      });
                    }}
                  >
                    确定
                  </Link>
                </Button>
                {size(selectedWorkUnitIds) === 0 && (
                  <div
                    style={{
                      position: "absolute",
                      width: "100%",
                      height: "100%",
                      left: 0,
                      top: 0,
                    }}
                    onClick={() => {
                      if (size(selectedWorkUnitIds) === 0) {
                        message.error("至少需要选择一个工作单元");
                      }
                    }}
                  />
                )}
              </div>
              <Button onClick={() => toggleSelecting()}>取消</Button>
            </Space>
          )}
          {!selectingUnits && (
            <Space>
              <Button
                type="primary"
                onClick={() => {
                  if (
                    ["draft", "collaboration"].includes(mode?.toString() || "")
                  ) {
                    let modules: string[] = [];
                    switch (mode) {
                      case "draft":
                        modules = ["个人设计"];
                        break;
                      case "collaboration":
                        modules = ["团队协同", "实时协同"];
                        break;
                      default:
                        modules = [];
                    }
                    publishEvent(`viewWorkUnitInfo`, modules, {
                      eventLevel: "P1",
                      viewType: "整合查看所有",
                      from: mode === "draft" ? "个人设计" : "团队协同",
                    });
                  }
                }}
                disabled={!combinedViewerUrl(true)}
              >
                <Link to={combinedViewerUrl(true)} target="_blank">
                  整合查看所有
                </Link>
              </Button>
              <Button onClick={() => toggleSelecting()} type="primary" ghost>
                整合查看
              </Button>
            </Space>
          )}
        </div>
      )}
      <div style={{ flex: "auto", marginTop: 16 }}>
        <Scrollbars {...defaultScrollbarSettings}>
          <Table
            rowSelection={rowSelection}
            pagination={{ pageSize: 200, hideOnSinglePage: true }}
            columns={columns}
            dataSource={workUnits.map((wu) => ({
              ...wu,
              key: wu.id!,
              versions: versions[wu.id!],
            }))}
          />
        </Scrollbars>
      </div>
    </div>
  );
}

export function VersionStatus({
  version,
  workUnitType,
  label = "查看",
  project,
  mode,
  isDocument,
}: {
  version: VersionVO | null;
  workUnitType?: string;
  label?: string;
  project: ProjectVO | null;
  mode?: string;
  isDocument?: boolean;
}) {
  if (!version || !isViewableFormat(workUnitType!)) return <span>查看</span>;
  const metaInfo = parseWorkUnitMetaInfo(version.viewingInfo); // mmeta
  let component = null;
  if (metaInfo.status === "failed" || metaInfo.status === "crash") {
    component = <Tag color="error">转换失败</Tag>;
  } else if (metaInfo.status === "processing") {
    component = <Tag color="processing">正在转换</Tag>;
  } else if (version.version === 0) {
    component = <span className="color-disabled">查看</span>;
  } else if (metaInfo.status === "nodata" || !metaInfo.status) {
    component = <Tag>无数据</Tag>;
  } else {
    component = (
      <Link
        onClick={() => {
          if (workUnitType === "rvt" || workUnitType === "dwg") {
            publishEvent(`viewOtherDocument`, ["团队协同", "轻量化显示"], {
              eventLevel: "P2",
              type: workUnitType,
            });
          } else if (
            ["draft", "collaboration"].includes(mode?.toString() || "")
          ) {
            let modules: string[] = [];
            switch (mode) {
              case "draft":
                modules = ["个人设计"];
                break;
              case "collaboration":
                modules = ["团队协同", "实时协同"];
                break;
              default:
                modules = [];
            }
            publishEvent(`viewWorkUnitInfo`, modules, {
              eventLevel: "P1",
              viewType: "单独查看",
              from: mode === "draft" ? "个人设计" : "团队协同",
            });
          }
        }}
        to={`/model-viewer?versionIdList=${version.id!}&format=${workUnitType}&title=“${
          project?.name
        }”模型查看`}
        target={`${version.id!}`}
      >
        {label}
      </Link>
    );
  }
  return <>{component}</>;
}
