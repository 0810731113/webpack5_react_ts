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
  Form,
  Popover,
  Input,
} from "antd";
import { ProjectParams, FileListParams } from "model/route-params.model";
import { InfoCircleFilled, FileFilled, FolderFilled } from "@ant-design/icons";
import Table, { ColumnType } from "antd/lib/table";
import {
  DataSetVO,
  VersionVO,
  Folder,
  Version,
  Project,
} from "api/generated/model";
import React, { useEffect } from "react";
import { Link, useHistory, useRouteMatch } from "react-router-dom";
import { fileService, workUnitService, folderService } from "service";
import { useImmer } from "use-immer";
import { defaultDateTimeFromString } from "function/date.func";
import VersionList from "component/Version/VersionList";
import { VersionStatus } from "component/WorkUnitList";
import { PopupVersions } from "component/Version/PopupVersions";
import { publishEvent } from "function/stats.func";
import { CheckPermission } from "component/CheckPermission/CheckPermission";
import { ResourcePermissionResourceEnum } from "api-authorization/generated/model";
import { useRecoilState } from "recoil";
import projectPageState from "state/project.state";
import { TooltipWrapper } from "component/wrapper/TooltipWrapper";
import { EditableCell } from "./EditableCell";
import UploadWorkUnitButton from "../UploadWorkUnitButton";

export interface FileListItem {
  isFolder: boolean;
  key: string;
  type: string;
  time: string | null | undefined;
  tipVersion?: VersionVO | null | undefined;
  record: Folder | DataSetVO;
}

type RowData = FileListItem & {
  // versions: VersionVO[];
  disabled?: boolean;
};
interface FileListProps {
  folderId?: string;
  parentUrl: string;
  disableToolbar?: boolean;

  workUnits: DataSetVO[];
  fileItems: FileListItem[];
  versions: { [workUnitId: string]: VersionVO[] };
  onReload: () => void;
  loadTree?: (refreshUrl: boolean) => void;
}

interface State {
  selectedRowKeys: React.Key[];
  workUnitMap: { [workUnitId: string]: DataSetVO };
  selectedVersions: { [workUnitId: string]: VersionVO | null };
  editingKey: string;
  creatingFolder: boolean;
}

export default function FileList(props: FileListProps) {
  const {
    fileItems,
    workUnits,
    versions,
    disableToolbar,
    folderId,
    onReload,
    loadTree,
    parentUrl,
  } = props;

  const {
    url,
    path,
    isExact,
    params: { projectId, teamId },
  } = useRouteMatch<FileListParams>();
  const [{ project }] = useRecoilState(projectPageState);
  const [
    {
      selectedVersions,
      selectedRowKeys: selectedRows,
      workUnitMap,
      creatingFolder,
      editingKey,
    },
    updateState,
  ] = useImmer<State>({
    selectedVersions: {},
    selectedRowKeys: [],
    workUnitMap: {},
    editingKey: "",
    creatingFolder: false,
  });

  const { replace } = useHistory();
  const [form] = Form.useForm();

  const cancel = () => {
    updateState((draft) => {
      draft.editingKey = "";
      draft.creatingFolder = false;
    });
  };
  const save = async () => {
    try {
      const row = await form.validateFields();

      if (creatingFolder) {
        if (folderId) {
          await folderService.createFolder(
            row.name,
            projectId,
            folderId,
            teamId,
          );
          publishEvent(`newFolder`, ["团队协同", "其它文档"], {
            eventLevel: "P2",
          });
        }
      } else {
        await folderService.renameFolder(editingKey, row.name);
      }

      cancel();
      onReload();
      loadTree?.(false);
    } catch (err) {
      console.log(err);
    }
  };

  const deleteFolder = (id: string) => {
    folderService
      .deleteFolder(id)
      .then(() => {
        onReload();
        loadTree?.(false);
      })
      .catch((err) => {
        alert(err.message);
      })
      .finally(() => {
        cancel();
      });
  };

  const renderFolderToolsButton = (item: FileListItem) => {
    if (item.key === editingKey) {
      return (
        <Space>
          <a onClick={save}>确定</a>
          <a onClick={cancel}>取消</a>
        </Space>
      );
    }
    return (
      <>
        <CheckPermission
          resouseType={ResourcePermissionResourceEnum.TeamDataset}
        >
          <TooltipWrapper
            when={(tooltipWrapperProps) =>
              tooltipWrapperProps.disabled ?? false
            }
            title="处于示例项目中无该功能权限"
          >
            <Button
              type="link"
              onClick={() => {
                form.setFieldsValue({ name: item.record.name, ...item });
                updateState((draft) => {
                  draft.editingKey = item.key!;
                });
              }}
            >
              重命名
            </Button>
          </TooltipWrapper>
        </CheckPermission>

        <Divider type="vertical" />
        <CheckPermission
          resouseType={ResourcePermissionResourceEnum.CollaborationSetting}
        >
          <TooltipWrapper
            when={(tooltipWrapperProps) =>
              tooltipWrapperProps.disabled ?? false
            }
            title="处于示例项目中无该功能权限"
          >
            <Button type="link" onClick={() => deleteFolder(item.key)}>
              删除
            </Button>
          </TooltipWrapper>
        </CheckPermission>
      </>
    );
  };
  function download(downloadUrl: string) {
    fileService.getDownloadFileUrl(downloadUrl).then((data) => {
      window.open(data.fileUrlWithSAS, "_blank");
    });
  }
  const renderFileToolsButton = (
    version: VersionVO | null | undefined,
    type: string,
    wuId: string,
    showUpload: boolean,
  ) => {
    if (!version) return <span>-</span>;
    return (
      <>
        <VersionStatus
          version={version}
          workUnitType={type}
          project={project}
        />

        <Divider type="vertical" />
        {!version.dataSetSourceFile && <span>下载</span>}
        {!!version.dataSetSourceFile && (
          <>
            {version.dataSetSourceFile && (
              <a
                onClick={(e) => {
                  e.preventDefault();
                  download(version.dataSetSourceFile!);
                  publishEvent(`downloadFile`, ["团队协同", "其它文档"], {
                    eventLevel: "P2",
                  });
                }}
              >
                下载
              </a>
            )}
            {!!folderId && showUpload && (
              <>
                <Divider type="vertical" />
                <CheckPermission
                  resouseType={ResourcePermissionResourceEnum.TeamDataset}
                >
                  <TooltipWrapper
                    when={(tooltipWrapperProps) =>
                      tooltipWrapperProps.disabled ?? false
                    }
                    title="处于示例项目中无该功能权限"
                  >
                    <UploadWorkUnitButton
                      title="新版本"
                      folderId={folderId}
                      teamId={teamId}
                      workUnitList={workUnits || []}
                      onComplete={() => {
                        onReload();
                        publishEvent(
                          `uploadNewFile`,
                          ["团队协同", "其它文档"],
                          { eventLevel: "P3" },
                        );
                      }}
                      renderAsLink
                      workUnitId={wuId}
                      asNewVersion
                    />
                  </TooltipWrapper>
                </CheckPermission>
              </>
            )}
          </>
        )}
      </>
    );
  };

  const columns: ColumnType<RowData>[] = [
    {
      title: "名字",
      dataIndex: "name",
      key: "name",
      render: (value, item: FileListItem) =>
        item.isFolder ? (
          <Space>
            <FolderFilled style={{ color: "#ffca28", fontSize: 16 }} />
            <Button
              style={{ color: "black", minWidth: "auto" }}
              type="link"
              onClick={() => {
                if (item.isFolder) {
                  replace(`${parentUrl}/folders/${item.record.id}`);
                } else {
                  alert("open item");
                }
              }}
            >
              {item.record.name}
            </Button>
          </Space>
        ) : (
          <Space>
            <FileFilled style={{ color: "#36cfc9", fontSize: 16 }} />
            <span>{item.record.name}</span>
          </Space>
        ),
    },
    {
      title: <span className="has-info-icon">类型</span>,
      dataIndex: "type",
      key: "type",
      width: "12%",
    },
    {
      title: "版本",
      dataIndex: "versions",
      key: "versions",
      className: "versions",
      width: "13%",
      render(value, item) {
        if (item.isFolder) {
          return "-";
        }
        return (
          <PopupVersions
            versions={versions[item.key]}
            operationRender={(version: VersionVO) =>
              renderFileToolsButton(version, item.type, item.key, false)
            }
          />
        );
      },
    },

    {
      title: "日期",
      dataIndex: "datetime",
      width: "20%",
      render(value, item) {
        return item.time ? defaultDateTimeFromString(item.time) : "-";
      },
    },
    // {
    //   title: "大小",
    //   dataIndex: "datetime",
    //   width: "15%",
    //   render(value, item) {
    //     return "等瑞阳";
    //   },
    // },
    {
      title: "操作",
      dataIndex: "id",
      key: "id",
      // align: "right",
      width: "20%",
      render(value, item) {
        if (item.isFolder) {
          return renderFolderToolsButton(item);
        }
        return renderFileToolsButton(
          item.tipVersion,
          item.type,
          item.key,
          true,
        );
      },
    },
  ];

  const mergedColumns = columns.map((col) => {
    if (col.dataIndex !== "name") {
      return col;
    }

    return {
      ...col,
      onCell: (record: FileListItem) => ({
        record,
        dataIndex: col.dataIndex,
        editing: record.key === editingKey,
        children: null,
      }),
    };
  });

  const handleData = (items: FileListItem[]) => {
    if (creatingFolder) {
      const newLine = {
        key: "newFolder",
        isFolder: true,
        time: null,
        type: "",
        record: {
          name: "",
        },
      };

      return [newLine, ...fileItems];
    }
    return fileItems;
    // fileItems.map((fi) => ({
    //   ...fi,
    //   versions: versions[fi.key],
    // }))
  };

  return (
    <Space
      className="work-unit-list"
      direction="vertical"
      style={{ width: "100%" }}
    >
      {!disableToolbar && (
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Space>
            {!!folderId && (
              <>
                <CheckPermission
                  resouseType={ResourcePermissionResourceEnum.TeamDataset}
                >
                  <TooltipWrapper
                    when={({ disabled }) => disabled ?? false}
                    title="处于示例项目中无该功能权限"
                  >
                    <UploadWorkUnitButton
                      folderId={folderId}
                      teamId={teamId}
                      workUnitList={workUnits || []}
                      onComplete={() => {
                        publishEvent(`uploadFile`, ["团队协同", "其它文档"], {
                          eventLevel: "P2",
                        });
                        onReload();
                      }}
                    />
                  </TooltipWrapper>
                </CheckPermission>

                <CheckPermission
                  resouseType={ResourcePermissionResourceEnum.TeamDataset}
                >
                  <TooltipWrapper
                    when={({ disabled }) => disabled ?? false}
                    title="处于示例项目中无该功能权限"
                  >
                    <Button
                      disabled={!!editingKey}
                      onClick={() => {
                        form.setFieldsValue({ name: "" });
                        updateState((draft) => {
                          draft.creatingFolder = true;
                          draft.editingKey = "newFolder";
                        });
                      }}
                    >
                      新建文件夹
                    </Button>
                  </TooltipWrapper>
                </CheckPermission>
              </>
            )}
          </Space>
          {/* <div>
            <Popover content="传输列表" placement="bottom">
              <a>传输列表：TODO</a>
            </Popover>
          </div> */}
        </div>
      )}
      <Form form={form} component={false}>
        <Table
          pagination={{ pageSize: 200, hideOnSinglePage: true }}
          columns={mergedColumns}
          dataSource={handleData(fileItems)}
          components={{
            body: {
              cell: EditableCell,
            },
          }}
        />
      </Form>
    </Space>
  );
}

// if (size(fileItems) === 0) {
//   return (
//     <div>
//       <Empty
//         description={
//           <div>
//             <Space direction="vertical">
//               <div>工作单元为空</div>
//               {!!folderId && (
//                 <UploadWorkUnitButton
//                   folderId={folderId}
//                   workUnitList={workUnits || []}
//                   onComplete={onReload}
//                 />
//               )}
//             </Space>
//           </div>
//         }
//       />
//     </div>
//   );
// }
