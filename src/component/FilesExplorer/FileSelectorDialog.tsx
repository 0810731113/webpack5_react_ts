import { Modal } from "antd";
import { FolderVO, FolderVOFolderTypeEnum } from "api/generated/model";
import React, { useEffect } from "react";
import { folderService } from "service";
import { useImmer } from "use-immer";
import FilesExplorer from "./FilesExplorer";

export interface FileSelectorDialogProps {
  projectId: string;
  teamId: string;
}

export interface State {
  rootFolder: FolderVO | null;
  folders: FolderVO[];
}

export default function FileSelectorDialog(props: FileSelectorDialogProps) {
  const { projectId, teamId } = props;
  const [{ rootFolder, folders }, updateState] = useImmer<State>({
    rootFolder: null,
    folders: [],
  });

  useEffect(() => {
    folderService.listFoldersByTeamId(teamId).then((folders) => {
      updateState((draft) => {
        draft.rootFolder =
          folders.find(
            (f) => f.folderType === FolderVOFolderTypeEnum.OtherFiles,
          ) ?? null;
        draft.folders = folders.filter((f) => !f.folderType);
      });
    });
  }, [teamId]);

  return (
    <Modal
      title="选择路径"
      okText="确认"
      cancelText="取消"
      visible
      bodyStyle={{ padding: 10 }}
    >
      {rootFolder && (
        <FilesExplorer
          projectId={projectId}
          teamId={teamId}
          folders={folders}
          rootFolderId={rootFolder.id!}
          onClick={console.log}
        />
      )}
    </Modal>
  );
}
