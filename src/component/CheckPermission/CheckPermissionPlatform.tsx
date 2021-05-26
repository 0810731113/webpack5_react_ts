import { isPanel } from "consts";
import { CheckPermission } from "./CheckPermission";
import { CheckPermissionPanel } from "./CheckPermissionPanel";

const CheckPermissionPlatform =
  isPanel === "true" ? CheckPermissionPanel : CheckPermission;
export default CheckPermissionPlatform;
