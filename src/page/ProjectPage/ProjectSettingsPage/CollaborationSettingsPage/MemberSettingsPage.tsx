import React, { useEffect } from "react";
import { Switch, Route, useRouteMatch } from "react-router";
import { ProjectParams, ProjectMemberParams } from "model/route-params.model";
import { Link } from "react-router-dom";
import { useImmer } from "use-immer";
import { UserTeamVO } from "api/generated/model";
import { teamService } from "service";

interface MemberSettingsPageProps {}

interface State {
  users: UserTeamVO[];
}

export default function MemberSettingsPage(props: MemberSettingsPageProps) {
  const {} = props;
  const [{ users }, updateState] = useImmer<State>({ users: [] });
  const {
    url,
    path,
    params: { projectId, teamId, userId },
  } = useRouteMatch<ProjectMemberParams>();

  useEffect(() => {
    teamService.getUsersInTeams(teamId).then((users) => {
      updateState((draft) => {
        draft.users = users!;
      });
    });
  }, []);

  return (
    <div>
      <h1>成员页</h1>
      <pre>{JSON.stringify(users, null, 2)}</pre>
    </div>
  );
}
