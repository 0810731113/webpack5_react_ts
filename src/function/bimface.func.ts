import { VersionVO } from "api/generated/model";
import { BimfaceProcessResult } from "model/bimface.model";

export function getVersionBfStatus({
  metaInfo,
}: {
  metaInfo?: string;
}): string | undefined {
  const meta: BimfaceProcessResult = JSON.parse(metaInfo ?? "{}");
  return meta.status;
}

export function isViewableFormat(format?: string | null) {
  if (!format) return false;
  return ["gap", "cloudify", "dwg", "workunit", "committedWorkunit"].includes(
    format,
  );
}

interface WorkUnitMetaInfo {
  fileId?: string;
  status: "success" | "failed" | "processing" | "nodata" | "crash";
}
export function parseWorkUnitMetaInfo(metaInfoStr?: string | null) {
  try {
    const metaInfo: WorkUnitMetaInfo = JSON.parse(metaInfoStr ?? "{}");
    return metaInfo;
  } catch {
    return { status: "nodata" };
  }
}

// export function isViewableVersion(version?: VersionVO | null) {
//   if (!version) return false;
//   const metaInfo = parseWorkUnitMetaInfo(version.viewingInfo);
//   return !(metaInfo.status === "nodata" || !metaInfo.status);
// }
