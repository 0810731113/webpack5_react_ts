import { useRequest } from "@umijs/hooks";
import { useEffect } from "react";
import { workUnitService } from "service";

export default function useTeamWorkUnits(teamId: string) {
  const { data, loading, run } = useRequest(
    () => workUnitService
        .listWorkUnitsByTeamId(teamId, "draft")
        .then((workUnits) => workUnits || []),
    {
      manual: true,
    },
  );

  useEffect(() => {
    run();
  }, [teamId]);

  return {
    workUnits: data,
    loading,
    run,
  };
}
