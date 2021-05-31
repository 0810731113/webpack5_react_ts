import { DataSetVO, VersionVO, Folder, FolderVO } from "api/generated/model";
import Loading from "component/Loading";
import { FileListParams } from "model/route-params.model";
import React, { useEffect } from "react";
import { useRouteMatch } from "react-router";
import { folderService, workUnitService } from "service";
import { useImmer } from "use-immer";
import { StringParam, useQueryParam } from "use-query-params";
// import "..//WorkUnitListPage.scss";
import FileList, { FileListItem } from "component/DiskManager/FileList";

export interface FileListPageProps {
  parentUrl: string;
  loadTree: (refreshUrl: boolean) => void;
}

export interface FileListPageState {
  workUnits: DataSetVO[] | null;
  subFolders: Folder[] | null;
  versions: { [workUnitId: string]: VersionVO[] } | null;
}

export default function FileListPage(props: FileListPageProps) {
  const { parentUrl, loadTree } = props;
  const {
    url,
    path,
    params: { folderId, teamId },
  } = useRouteMatch<FileListParams>();
  const [mode] = useQueryParam("mode", StringParam);
  const [{ workUnits, versions, subFolders }, updateState] = useImmer<
    FileListPageState
  >({
    workUnits: null,
    versions: null,
    subFolders: null,
  });

  function loadWorkUnitsAndFolders() {
    folderService.listChildFolders(folderId).then((folders) => {
      updateState((draft) => void (draft.subFolders = folders));
    });

    workUnitService.listWorkUnits(folderId).then((workUnits) => {
      updateState((draft) => {
        draft.workUnits = workUnits;
      });
      workUnitService
        .batchLoadWorkUnitsVersions(workUnits.map((workUnit) => workUnit.id!))
        .then((result) => {
          console.log("batch loaded:", result);
          updateState((draft) => {
            draft.versions = result;
          });
        });
    });
  }

  useEffect(() => {
    loadWorkUnitsAndFolders();

    return () => {
      updateState((draft) => {
        draft.workUnits = null;
      });
    };
  }, [folderId]);

  if (workUnits === null || versions === null) {
    return (
      <div className="workunit-list-page">
        <Loading absolute size={48} />
      </div>
    );
  }

  const fileItems: FileListItem[] = [
    ...(subFolders
      ? subFolders.map((folder) => ({
          isFolder: true,
          key: folder.id!,
          time: folder.updateTime,
          tipVersion: null,
          type: "-",
          record: folder,
        }))
      : []),
    ...(workUnits
      ? workUnits.map((workUnit) => {
          let tipVersion = null;
          if (
            versions &&
            workUnit.id &&
            versions[workUnit.id] instanceof Array
          ) {
            tipVersion = versions[workUnit.id].find(
              (version) => version.version === workUnit.tipVersion,
            );
          }
          return {
            isFolder: false,
            key: workUnit.id!,
            type: workUnit.type ? workUnit.type : "",
            time: tipVersion?.creationTime,
            tipVersion,
            record: workUnit,
          };
        })
      : []),
  ];

  return (
    <div className="workunit-list-page">
      <FileList
        fileItems={fileItems}
        workUnits={workUnits}
        versions={versions}
        folderId={folderId}
        onReload={loadWorkUnitsAndFolders}
        loadTree={loadTree}
        parentUrl={parentUrl}
      />
    </div>
  );
}
