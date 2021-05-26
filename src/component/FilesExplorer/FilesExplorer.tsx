import {
  EnterOutlined,
  FileOutlined,
  FolderOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import { Breadcrumb, Button, Space } from "antd";
import Column from "antd/lib/table/Column";
import { DataSetVO, FolderVO } from "api/generated/model";
import Table from "component/Table";
import { nth, size } from "lodash";
import React, { useEffect } from "react";
import { workUnitService } from "service";
import { useImmer } from "use-immer";
import { useQueryParam, withDefault, BooleanParam } from "use-query-params";
import "./fileSelector.scss";

export interface FilesExplorerProps {
  rootFolderId: string;
  folders: FolderVO[];
  projectId: string;
  teamId: string;
  filterFormats?: string[];
  withFileName?: boolean;
  onClick: (folderId: string, workUnitId?: string, type?: string) => void;
}

export interface State {
  selectedFolderId: string;
  selectedFileId: string;
  workUnits: DataSetVO[];
}

export default function FilesExplorer(props: FilesExplorerProps) {
  const {
    folders,
    rootFolderId,
    filterFormats,
    withFileName,
    onClick,
  } = props;
  const [
    { selectedFolderId, workUnits, selectedFileId },
    updateState,
  ] = useImmer<State>({
    selectedFolderId: rootFolderId,
    selectedFileId: "",
    workUnits: [],
  });
  const [folderOnly] = useQueryParam(
    "folderOnly",
    withDefault(BooleanParam, false),
  );

  useEffect(() => {
    if (selectedFolderId && !folderOnly) {
      workUnitService.listWorkUnits(selectedFolderId).then((workUnits) => {
        updateState((draft) => {
          draft.workUnits= workUnits.filter((wu:any) => filterFormats?.includes(wu.type))
        });
      });
    }
  }, [selectedFolderId, filterFormats]);

  const folderPath: FolderVO[] = [];
  if (selectedFolderId) {
    let folder = folders.find((f) => f.id === selectedFolderId);
    if (folder) {
      folderPath.push(folder);
      while (folder!.parentId) {
        if (folder!.parentId === rootFolderId) break;
        folder = folders.find((f) => f.id === folder!.parentId);
        if (folder) {
          folderPath.push(folder);
        }
      }
    }
  }

  function setSelectedFolderId(id: string) {
    updateState((draft) => {
      draft.selectedFolderId = id;
      onClick(id);
    });
  }

  const showPath = size(folderPath) > 0;

  const fileItems: FileItem[] = [
    ...folders
      .filter((folder) =>
        selectedFolderId
          ? folder.parentId === selectedFolderId
          : !folder.parentId,
      )
      .map((folder) => ({
        folder: true,
        name: folder.name!,
        record: folder,
      })),
    ...workUnits.map((workUnit) => ({
      folder: false,
      name: workUnit.name!,
      type: workUnit.type!,
      record: workUnit,
    })),
  ];
  return (
    <div>
      {showPath && (
        <Breadcrumb style={{ fontSize: 11, marginBottom: 5, paddingTop: 5 }}>
          <Breadcrumb.Item
            onClick={() => {
              setSelectedFolderId(rootFolderId);
            }}
          >
            <HomeOutlined />
          </Breadcrumb.Item>
          <Breadcrumb.Item
            onClick={() => {
              const folder = nth(folderPath, -2);
              setSelectedFolderId(folder ? folder.id! : rootFolderId);
            }}
          >
            <EnterOutlined style={{ transform: "rotate(90deg)" }} />
          </Breadcrumb.Item>
          {folderPath.reverse().map((folder) => (
              <Breadcrumb.Item
                onClick={() => {
                  setSelectedFolderId(folder.id!);
                }}
              >
                {folder.name}
              </Breadcrumb.Item>
            ))}
        </Breadcrumb>
      )}
      <Table
        size="small"
        dataSource={fileItems}
        pagination={false}
        className="files-tabel"
      >
        <Column
          title="文件名"
          dataIndex="name"
          render={(value, item: FileItem) => (
              <Space
                className={
                  selectedFileId === item.record.id ? "selected tcell" : "tcell"
                }
              >
                {item.folder ? (
                  <>
                    <FolderOutlined />
                    <Button
                      type="link"
                      onClick={() => {
                        setSelectedFolderId(item.record.id!);
                        onClick(item.record.id!);
                      }}
                    >
                      {value}
                    </Button>
                  </>
                ) : (
                  <>
                    <FileOutlined />
                    {withFileName ? (
                      <span>{value}</span>
                    ) : (
                      <Button
                        type="link"
                        onClick={() => {
                          updateState(
                            (draft) =>
                              void (draft.selectedFileId = item.record.id!),
                          );
                          onClick(selectedFolderId, item.record.id!, item.type);
                        }}
                      >
                        {value}
                      </Button>
                    )}
                  </>
                )}
              </Space>
            )}
        />
        <Column
          title="类型"
          dataIndex="type"
          render={(value, item: FileItem) => (
              <Space
                className={
                  selectedFileId === item.record.id ? "selected tcell" : "tcell"
                }
              >
                {value}
              </Space>
            )}
        />
        {/* <Column title="版本" /> */}
      </Table>
    </div>
  );
}

interface FileItem {
  folder: boolean;
  type?: string;
  name: string;
  record: FolderVO | DataSetVO;
}
