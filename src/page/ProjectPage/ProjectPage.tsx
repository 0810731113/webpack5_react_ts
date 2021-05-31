import Loading from "component/Loading";
import { onResponseError } from "function/auth.func";
import useLoading from "hook/use-loading.hook";
import produce from "immer";
import { ProjectParams } from "model/route-params.model";
import { User } from "api/generated/model";
import React, { useCallback, useState } from "react";
import { Route, Switch, useRouteMatch } from "react-router";
import { useRecoilState } from "recoil";
import { projectService, teamService, userService } from "service";
import projectPageState from "state/project.state";
import AppsPage from "./AppsPage/AppsPage";
import CollaborationPage from "./CollaborationPage/CollaborationPage";
import PersonalPage from "./PersonalPage/PersonalPage";
import "./ProjectPage.scss";
import ProjectHeader from "./ProjectPageComponents/ProjectHeader";
import ProjectSidebar from "./ProjectPageComponents/ProjectSidebar";
import ProjectPageContext from "./ProjectPageContext";
import ProjectSettingsPage from "./ProjectSettingsPage/ProjectSettingsPage";
import DeliveryPage from "./DeliveryPage/DeliveryPage";
import OverviewPage from "./OverviewPage/ProjectOverviewPage";

interface ProjectPageProps {}

interface State {
  selectedMenyKey: string | null;
}

export default function ProjectPage(props: ProjectPageProps) {
  const {} = props;
  const [{ project }, setState] = useRecoilState(projectPageState);
  const {
    path,
    url,
    params: { projectId },
  } = useRouteMatch<ProjectParams>();
  const [selectedMenuKey, setSelectedMenuKey] = useState<string | null>(null);
  // const { breadCrumbs } = useBreadCrumbs(project?.name ?? "", "project", url);

  const dataLoader = useCallback(
    () => projectService.loadRequiredData(projectId),
    [projectId],
  );
  const { loading } = useLoading(dataLoader, (data) => {
    if (data) {
      const [projectData, teams, users, specialties, roles, resources] = data;
      setState((pre) =>
        produce(pre, (draft) => {
          draft.project = projectData ?? null;
          draft.teams = teams ?? [];
          draft.users = users ?? [];
          draft.specialties = specialties ?? [];
          draft.roles = roles ?? [];
          draft.resources = resources ?? [];
        }),
      );
    }
  });

  async function cacheTeams(thisProjectId: string) {
    const teams = await teamService.listTeams(thisProjectId);
    setState((pre) =>
      produce(pre, (draft) => {
        draft.teams = teams ?? [];
      }),
    );
    const myTeams = (await teamService.listMyTeam(thisProjectId)) ?? null;
    setState((state) => ({
      ...state,
      myTeams,
    }));
  }

  async function refreshProjectData(thisProjectId: string) {
    const projectData = await projectService.loadProjectById(thisProjectId);
    setState((pre) =>
      produce(pre, (draft) => {
        draft.project = projectData ?? null;
      }),
    );
  }

  async function cacheUsers(thisProjectId: string, userId: string) {
    let users = await userService.listUsers(thisProjectId);

    // handle user not in project
    if (userId && !users?.find((user) => user.id === userId)) {
      const newUserInfo = await userService.userinfoById(userId);

      if (newUserInfo) {
        const newUser: User = {
          avatarPath: newUserInfo.avatarPath ? newUserInfo.avatarPath[0] : "",
          email: newUserInfo.email,
          id: newUserInfo.id,
          name: newUserInfo.nickname,
          telephone: newUserInfo.mobile,
        };
        users = [...(users ?? []), newUser];
      }
    }
    setState((pre) =>
      produce(pre, (draft) => {
        draft.users = users ?? [];
      }),
    );
  }

  if (loading) {
    return (
      <div className="project-page">
        <Loading absolute size={64} />
      </div>
    );
  }

  if (!project) {
    return <Loading />;
  }

  return (
    <ProjectPageContext.Provider
      value={{
        setSelectedMenuKey(key) {
          setSelectedMenuKey(key);
        },
        onRefreshProjectData(id) {
          refreshProjectData(id);
        },
        onUserNotFound(id) {
          cacheUsers(projectId, id);
        },
        onTeamNotFound(id) {
          cacheTeams(projectId);
        },
        onResponseError(error) {
          onResponseError(error);
        },
      }}
    >
      <div className="project-page">
        <ProjectHeader needBack />
        <div className="body">
          <ProjectSidebar
            projectName={project.name!}
            selectedMenuKey={selectedMenuKey ?? ""}
          />
          <main>
            <Switch>
              <Route path={`${path}/overview`} component={OverviewPage} />
              <Route path={`${path}/personal`} component={PersonalPage} />
              <Route
                path={`${path}/collaboration/teams/:teamId`}
                component={CollaborationPage}
              />
              <Route path={`${path}/apps`} component={AppsPage} />
              <Route path={`${path}/delivery`} component={DeliveryPage} />
              <Route
                path={`${path}/settings`}
                component={ProjectSettingsPage}
              />
            </Switch>
          </main>
        </div>
      </div>
    </ProjectPageContext.Provider>
  );
}
