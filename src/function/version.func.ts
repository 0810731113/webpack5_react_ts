import { Version, VersionVO } from "api/generated/model";
import { parseWorkUnitMetaInfo } from "./bimface.func";

export enum ConvertStatus {
  success = "success",
  processing = "processing",
  error = "failed",
  crash = "crash",
  nodata = "nodata",
}
export const getStatus = (version: Version | VersionVO) => {
  if (version) {
    const str = version.viewingInfo; // mmeta
    if (str) {
      const obj = JSON.parse(str);
      if (obj && obj.status) {
        return obj.status;
      } 
        return ConvertStatus.nodata;
      
    } 
      return ConvertStatus.nodata;
    
  } 
    return ConvertStatus.nodata;
  
};
export const getErrorStatusType = (version: Version, disabled?: boolean) => {
  if (disabled) {
    return { label: "", className: "not-done-label" };
  }
  switch (getStatus(version)) {
    case ConvertStatus.nodata:
      return { label: "无可视内容", className: "not-done-label" };
    case ConvertStatus.error:
      return { label: "无可视内容", className: "not-done-label" };
    case ConvertStatus.processing:
      return { label: "转换中", className: "not-done-processing" };
    default:
      return false;
  }
};

export function isVersionViewable(version: VersionVO | null) {
  if (!version) return false;
  const metaInfo = parseWorkUnitMetaInfo(version.viewingInfo);
  return metaInfo?.status === "success";
}
