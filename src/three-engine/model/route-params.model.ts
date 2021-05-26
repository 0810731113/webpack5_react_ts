export interface ProjectParams {
  projectId: string;
}

export interface ProjectTeamParams extends ProjectParams {
  teamId: string;
}

export interface WorkUnitListParams extends ProjectParams {
  folderId: string;
}

export interface ArchiveEditorParams extends ProjectParams {
  archiveId: string;
}
  