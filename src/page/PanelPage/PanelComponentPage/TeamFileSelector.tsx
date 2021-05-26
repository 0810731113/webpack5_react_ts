import { Input, message, Select, Tag } from "antd";
import { FolderVO, FolderVOFolderTypeEnum } from "api/generated/model";
import FilesExplorer from "component/FilesExplorer/FilesExplorer";
import { first, trim } from "lodash";
import React, { useEffect } from "react";
import { folderService } from "service";
import panelService from "service/panel.service";
import { useImmer } from "use-immer";
import {
  BooleanParam,
  StringParam,
  useQueryParams,
  withDefault,
} from "use-query-params";
import "./TeamFileSelector.scss";
import Loading from "component/Loading";

export interface TeamFileSelectorProps {
  projectId: string;
}

export interface State {
  rootFolder: FolderVO | null;
  folders: FolderVO[];
  folderId?: string;
  workUnitId?: string;
  filename: string;
  formats: string[];
  selectedExtension: string;
}

export default function TeamFileSelector(props: TeamFileSelectorProps) {
  const { projectId } = props;
  const [{ teamId, withFileName, fileFormats }] = useQueryParams({
    teamId: StringParam,
    withFileName: withDefault(BooleanParam, false),
    fileFormats: withDefault(StringParam, "ydb"),
  });
  const [
    {
      rootFolder,
      folders,
      filename,
      formats,
      selectedExtension,
      folderId,
      workUnitId,
    },
    updateState,
  ] = useImmer<State>({
    rootFolder: null,
    folders: [],
    filename: "",
    formats: [],
    selectedExtension: "",
  });

  useEffect(() => {
    if (fileFormats) {
      updateState((draft) => {
        draft.formats = fileFormats.split(",");
        if (!selectedExtension) {
          draft.selectedExtension = first(draft.formats) ?? "";
        }
      });
    }
  }, [fileFormats]);

  async function listFolders(teamId: string) {
    const folders = await folderService
      .listFoldersByTeamId(teamId)
      .catch((e) => {
        message.error(e.message);
      });
    if (folders) {
      updateState((draft) => {
        draft.rootFolder =
          folders.find(
            (f) => f.folderType === FolderVOFolderTypeEnum.OtherFiles,
          ) ?? null;
        draft.folders = folders.filter((f) => !f.folderType);
      });
    }
  }
  useEffect(() => {
    (async () => {
      if (!teamId) return;
      listFolders(teamId);
    })();
  }, [teamId]);

  useEffect(() => {
    if (rootFolder) {
      panelService.selectFileOrFolder(rootFolder.id!);
      updateState((draft) => {
        draft.folderId = rootFolder.id!;
      });
    }
  }, [rootFolder]);

  if (!teamId) {
    return <Tag color="tomato">必须提供 teamId</Tag>;
  }

  if (!rootFolder) {
    return <Loading />;
    // return <Tag color="tomato">无法找到根目录</Tag>;
  }

  return (
    <div className="team-file-selector">
      {rootFolder && (
        <>
          <FilesExplorer
            projectId={projectId}
            teamId={teamId}
            folders={folders}
            rootFolderId={rootFolder.id!}
            filterFormats={withFileName ? [selectedExtension] : formats}
            withFileName={withFileName}
            onClick={(folderId, workUnitId, type) => {
              panelService.selectFileOrFolder(
                folderId,
                workUnitId,
                filename,
                type,
              );
              updateState((draft) => {
                draft.folderId = folderId;
                draft.workUnitId = workUnitId;
              });
            }}
          />
          {withFileName && (
            <div className="filename-editor">
              <Input
                size="small"
                placeholder="请输入文件名"
                value={filename}
                onBlur={(e) => {
                  e.persist();
                  panelService.selectFileOrFolder(
                    folderId,
                    workUnitId,
                    e.target.value,
                    selectedExtension,
                  );
                }}
                onChange={(e) => {
                  e.persist();
                  updateState((draft) => {
                    draft.filename = trim(e.target.value);
                  });
                }}
              />
              <Select
                size="small"
                value={selectedExtension}
                onChange={(value) => {
                  updateState((draft) => {
                    draft.selectedExtension = value;
                  });
                  panelService.selectFileOrFolder(
                    folderId,
                    workUnitId,
                    filename,
                    value,
                  );
                }}
              >
                {formats.map((ext) => (
                  <Select.Option value={ext}>{ext}</Select.Option>
                ))}
              </Select>
            </div>
          )}
        </>
      )}
    </div>
  );
}
