export interface ProjectParams {
  projectId: string;
}

export interface ProjectTeamParams extends ProjectParams {
  teamId: string;
}

export interface TeamWorkUnitListParams extends ProjectParams {
  teamId: string;
  type: "draft" | "committed";
}

export interface WorkUnitListParams extends ProjectParams {
  folderId: string;
}

export interface FileListParams extends ProjectTeamParams {
  folderId: string;
}

export interface ProjectTeamPackageParams extends ProjectTeamParams {
  packageId: string;
}

export interface ProjectWorkUnitParams extends ProjectTeamParams {
  datasetId: string;
}

export interface ProjectMemberParams extends ProjectTeamParams {
  userId: string;
}

export interface ArchiveParams extends ProjectParams {
  archiveId: string;
}

export interface SoftwareParams {
  software: "garch" | "gstr" | "gmep";
}

export interface VideosParams {
  album: "garch" | "gstr" | "gmep" | "gdcp" | "cases";
}
export interface ApplyParams {
  applyType: "individual" | "enterprise";
}
