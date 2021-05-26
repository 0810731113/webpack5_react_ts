import { Folder } from "api/generated/model";
import React from "react";
import { useRecoilValue } from "recoil";
import { folderByIdSelector } from "state/project.state";

export interface FolderNodeProps {
  folderId: string;
}

export interface FolderNodeState {}

export default function FolderNode(props: FolderNodeProps) {
  const { folderId } = props;
  const folder: Folder | undefined = useRecoilValue(folderByIdSelector(folderId));

  if (!folder) {
    return <h1>Loading</h1>;
  }

  return (
    <div>
      FolderNode
      <pre>{JSON.stringify(folder, null, 2)}</pre>
    </div>
  );
}
