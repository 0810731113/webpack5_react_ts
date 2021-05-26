import { useRequest } from "@umijs/hooks";
import { useEffect } from "react";
import { teamService } from "service";

export default function useTeamUsers(teamId: string) {
  const { data, loading, run } = useRequest(
    () => teamService.getUsersInTeams(teamId).then((users) => users || []),
    {
      manual: true,
    },
  );

  useEffect(() => {
    run();
  }, [teamId]);

  return {
    users: data,
    loading,
    run,
  };
}
export function useMyTeams(projectId: string) {
  const { data, loading, run } = useRequest(
    () => teamService.listMyTeam(projectId).then((teams) => teams || []),
    {
      manual: true,
    },
  );

  useEffect(() => {
    if (projectId) {
      run();
    }
  }, [projectId]);

  return {
    myTeams: data,
    loading,
    run,
  };
}
