import { useState, useCallback, useEffect } from "react";
import { permissionService } from "service";
import useLoading from "hook/use-loading.hook";
import { TeamPermissionResources } from "api/generated/model";
import { fromBits } from "long";
import { message } from "antd";

export const usePermissions = (teamId: string, type?: "Trust" | "TrustBy") => {
  const [permissions, setPermissions] = useState<TeamPermissionResources[]>([]);
  const getData = useCallback(async () => {
    if (teamId) {
      try {
        const list = await permissionService.listPermission(teamId, type);
        setPermissions(list ?? []);
      } catch (err) {
        message.error(err);
      }
    }
  }, [teamId, type]);
  const { loading } = useLoading(getData, undefined, null);
  return { permissions, refresh: getData, loading };
};
