import { ResourcePermission } from "api-authorization/generated/model";
import { AxiosError } from "axios";
import { createContext } from "react";
import {
  DataSetVO,
  SpecialtyVO,
  SpecialtyVOTypeEnum,
  VersionVO,
} from "api/generated/model";
import { ReferedVersionVO } from "./ReferPage";

export enum ProjectContentEnum {
  Samples = "samples",
  Mine = "",
}

export interface PanelPageContext {
  userId: string | null;
  accessToken: string | null;
  workUnit: DataSetVO | null;
  workUnits: DataSetVO[] | null;
  version: VersionVO | null;
  projectId: string | null;
  specialtyType: SpecialtyVOTypeEnum;
  specialties?: SpecialtyVO[] | null;
  referingVersionIds: number[];
  referedVersions: ReferedVersionVO[];
  referWorkUnits: DataSetVO[] | null;
  workunitReadonly: boolean;
  showprocess: 0 | 1;
  logs: any[];
  resources: ResourcePermission[];
  projectContent: ProjectContentEnum | null;
  setSpecialties(value: SpecialtyVO[] | null | undefined): void;

  currentOperatingWorkUnitId: string | null;
  // 打开工作单元
  openingWorkUnit: boolean;
  setOpeningWorkUnit(value: boolean): void;

  // 保存工作单元
  savingWorkUnit: boolean;
  setSavingWorkUnit(value: boolean): void;

  // 提交工作单元
  commitingWorkUnit: boolean;
  setCommitingWorkUnit(value: boolean): void;
  setShowprocess(value: 0 | 1): void;

  setWorkUnit: (workUnit: DataSetVO | null) => void;
  setWorkUnits: (workUnits: DataSetVO[] | null) => void;
  setReferWorkUnits: (workUnits: DataSetVO[] | null) => void;
  setVersion: (version: VersionVO | null) => void;
  setCurrentOperationWorkUnitId: (id: string | null) => void;
  setProjectId: (id: string | null) => void;
  setReferingVersionIds: (ids: number[]) => void;
  setReferedVersions: (versions: ReferedVersionVO[]) => void;
  setWorkunitReadonly: (readonly: boolean) => void;
  pushLog: (log: any) => void;
  resetProject: () => void;
  setProjectContent: (content: ProjectContentEnum) => void;

  onResponseError: (error: AxiosError) => void;

  refreshCount: number;
}

export default createContext<PanelPageContext>({} as any);
