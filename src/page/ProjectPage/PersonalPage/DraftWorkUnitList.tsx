import {
  Button,
  Empty,
  notification,
  Input,
  Space,
  Tag,
  Tooltip,
  Typography,
  message,
  Form,
} from "antd";
import { InfoCircleFilled, InfoCircleOutlined } from "@ant-design/icons";
import Table, { ColumnType } from "antd/lib/table";
import { TableRowSelection } from "antd/lib/table/interface";
import { DataSetVO, Project, VersionVO } from "api/generated/model";
import { isViewableFormat } from "function/bimface.func";
import { clone, first, orderBy, size, runInContext } from "lodash";
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useImmer } from "use-immer";
import { isVersionViewable } from "function/version.func";

import { defaultDateTimeFromString } from "function/date.func";
import { useRecoilValue, useRecoilState } from "recoil";
import projectPageState from "state/project.state";
import ProjectTeamName from "page/ProjectPage/_components/ProjectTeamName";
import Scrollbars from "react-custom-scrollbars";
import consts, { defaultScrollbarSettings } from "consts";
import { publishEvent } from "function/stats.func";
import { VersionStatus } from "component/WorkUnitList";
import { PopupSelectVersions } from "component/Version/PopupSelectVersions";
import { versionService } from "service";
import { onResponseError } from "function/auth.func";

export type RowData = DataSetVO & {
  key: string;
  versions: VersionVO[];
  disabled?: boolean;
};
export interface DraftWorkUnitListProps {
  workUnits: DataSetVO[];
  versions: { [workUnitId: string]: VersionVO[] };
  setVersion: (dsId: string, versionId: number, desc: string) => void;
  extraActions?: (
    workUnit: RowData,
    version?: VersionVO,
    isMaxVersion?: boolean,
    modifyDescription?: () => void,
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
}

export default function DraftWorkUnitList(props: DraftWorkUnitListProps) {
  const {
    workUnits,
    versions,
    setCheckedVersionIds,
    extraActions,
    setVersion,
    onReload,
    onStandardColumns,
  } = props;

  const [
    { selectingUnits, selectedVersions, selectedWorkUnitIds, workUnitMap },
    updateState,
  ] = useImmer<State>({
    selectingUnits: false,
    selectedVersions: {},
    selectedWorkUnitIds: [],
    workUnitMap: {},
  });

  const [editingKey, setEditingKey] = useState("");
  const [form] = Form.useForm();
  const [{ teams, currentUser, project }] = useRecoilState(projectPageState);

  const isLineDisabled = (record: RowData) => {
    const version = selectedVersions[record.id!];
    return (
      record.disabled ||
      !isViewableFormat(record.type) ||
      //! isViewableVersion(version) ||
      !isVersionViewable(version)
    );
  };

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

  useEffect(() => {
    updateState((draft) => {
      workUnits.forEach((wu) => {
        draft.workUnitMap[wu.id!] = wu;
      });
    });
  }, [workUnits]);

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

  useEffect(() => {
    form.resetFields();
  }, [editingKey]);

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

  const columns: ColumnType<RowData>[] = [
    {
      title: "工作单元名称",
      dataIndex: "name",
      key: "name",
    },

    {
      title: (
        <span className="has-info-icon">
          版本
          <Tooltip
            title="在广联达建筑设计、广联达结构设计、广联达机电设计软件上进行“保存”或“提交”操作后将产生版本，目前仅支持删除“保存”产生的版本"
            trigger="hover"
            placement="top"
          >
            <InfoCircleOutlined style={{ color: "rgba(0, 0, 0, 0.85)" }} />
          </Tooltip>
        </span>
      ),
      dataIndex: "versions",
      key: "versions",
      width: 100,
      render(value, record) {
        if (record.disabled) {
          return "-";
        }

        const _versions = orderBy(versions[record.id!], "version").reverse();

        return (
          <PopupSelectVersions
            versions={_versions}
            selectedVersion={selectedVersions[record.id!] ?? null}
            onVersionSelected={(version) => {
              setEditingKey("");
              updateState((newDraft) => {
                newDraft.selectedVersions[version?.dataSetId ?? ""] = version;
              });
            }}
          />
        );
      },
    },
    {
      title: "日期",
      dataIndex: "datetime",
      width: 175,
      render(value, record) {
        const version = selectedVersions[record.id!];
        return <span>{defaultDateTimeFromString(version?.creationTime)}</span>;
      },
    },
    {
      title: "注释",
      dataIndex: "description",
      ellipsis: true,
      render(value, record) {
        const version = selectedVersions[record.id!];
        return version?.description;
      },
    },
    {
      title: "所属团队",
      filters: teams.map((team) => ({
        text: team.name,
        value: team.id!,
      })),
      width: 120,
      ellipsis: true,
      onFilter: (value, record) => record.teamId === value,
      render(value, record) {
        return <ProjectTeamName id={record.teamId!} />;
      },
    },
    {
      title: "操作",
      dataIndex: "id",
      key: "id",
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
              <InfoCircleFilled style={{ color: "#faad14", fontSize: 14 }} />
            </Tooltip>
          );
        }

        if (record.id === editingKey) {
          return (
            <Space size="middle">
              <a
                onClick={() => {
                  const desc = form.getFieldValue("description");

                  versionService
                    .modifyDescription(value!, version.version!, desc)
                    .then(() => {
                      updateState((_draft) => {
                        _draft.selectedVersions[value!]!.description = desc;
                      });
                      setVersion(value!, version.id!, desc);
                      message.success("注释修改成功");
                    })
                    .catch((err) => {
                      message.error(err.message);
                    })
                    .finally(() => {
                      setEditingKey("");
                    });
                }}
              >
                确定
              </a>
              <a onClick={() => setEditingKey("")}>取消</a>
            </Space>
          );
        }

        const maxVersion = versions[record.id!].reduce((prev, cur) =>
          (prev.version ?? 0) > (cur.version ?? -1) ? prev : cur,
        );
        return extraActions?.(
          record,
          version,
          maxVersion.id === version.id,
          () => setEditingKey(record.id ?? ""),
        );
      },
    },
  ];
  // onStandardColumns?.(tcolumns);

  const mergedColumns = columns.map((col) => {
    if (col.dataIndex !== "description") {
      return col;
    }

    return {
      ...col,
      onCell: (record: DataSetVO) => ({
        record,
        editing: record.id === editingKey && col.dataIndex === "description",
        children: null,
        defaultValue: selectedVersions[record.id!]?.description ?? "",
      }),
    };
  });

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

  return (
    <div className="work-unit-list">
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        {selectingUnits && (
          <Space>
            {`整合查看的工作单元：${size(selectedWorkUnitIds)}`}
            <div style={{ position: "relative" }}>
              <Button
                type="primary"
                disabled={size(selectedWorkUnitIds) === 0}
                onClick={() => {
                  const modules = ["个人设计"];

                  publishEvent(`viewWorkUnitInfo`, modules, {
                    eventLevel: "P1",
                    viewType: "整合查看",
                    from: "个人设计",
                  });
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
                const modules = ["个人设计"];

                publishEvent(`viewWorkUnitInfo`, modules, {
                  eventLevel: "P1",
                  viewType: "整合查看所有",
                  from: "个人设计",
                });
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

      <div style={{ flex: "auto", marginTop: 16 }}>
        <Scrollbars {...defaultScrollbarSettings}>
          <Form form={form} component={false}>
            <Table
              rowSelection={rowSelection}
              pagination={{ pageSize: 200, hideOnSinglePage: true }}
              columns={mergedColumns}
              dataSource={workUnits.map((wu) => ({
                ...wu,
                key: wu.id!,
                versions: versions[wu.id!],
              }))}
              components={{
                body: {
                  // eslint-disable-next-line @typescript-eslint/no-use-before-define
                  cell: EditableDraftCell,
                },
              }}
            />
          </Form>
        </Scrollbars>
      </div>
    </div>
  );
}

interface EditableDraftCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean;
  dataIndex: string;
  record: DataSetVO;
  index: number;
  children: React.ReactNode;
}

export const EditableDraftCell: React.FC<EditableDraftCellProps> = ({
  editing,
  record,
  index,
  children,
  defaultValue,
  ...restProps
}) => {
  const inputRef = useRef<Input>(null);

  const formNode = (
    <Form.Item name="description" initialValue={defaultValue}>
      <Input
        size="small"
        ref={inputRef}
        maxLength={200}
        placeholder="请输入注释，200字以内"
        style={{ maxWidth: "100%" }}
      />
    </Form.Item>
  );
  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
    }
  }, [editing]);

  return <td {...restProps}>{editing ? formNode : children}</td>;
};
