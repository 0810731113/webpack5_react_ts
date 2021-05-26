/* eslint-disable @typescript-eslint/no-use-before-define */
import React, { useEffect, useContext } from "react";
import { Switch, Route, useRouteMatch } from "react-router";
import { ProjectParams } from "model/route-params.model";
import { Link, useHistory } from "react-router-dom";
import { Button, Checkbox, Select, Tabs, message, Modal } from "antd";
import { useImmer } from "use-immer";
import "./CollaborationSettingsPage.scss";
import { NAV, defaultScrollbarSettings } from "consts";
import useNavMenu from "hook/use-nav-menu.hook";
import { useRecoilValue } from "recoil";
import projectPageState from "state/project.state";
import ProjectPageContext from "page/ProjectPage/ProjectPageContext";

import Iconfont from "component/Iconfont";
import AllUserListPage from "./AllUserListPage";
import AllWorkUnitListPage from "./AllWorkUnitListPage";
import TeamListPage from "./TeamListPage";
import TeamDetailsPage from "./TeamDetailsPage";
import RoleSettingsPage from "./RoleSettingsPage";

interface PermissionSettingsPageProps {}

interface State {
  activeTab: string;
}

const { TabPane } = Tabs;

export default function PermissionSettingsPage(
  props: PermissionSettingsPageProps,
) {
  const {} = props;
  const [{ activeTab }, updateState] = useImmer<State>({
    activeTab: "permission",
  });
  const {
    url,
    path,
    isExact,
    params: { projectId },
  } = useRouteMatch<ProjectParams>();

  const { replace } = useHistory();
  useNavMenu(NAV.settingsProjectSettings);

  useEffect(() => {
    if (isExact) {
      replace(`${url}/teams`);
    }
  }, [isExact]);

  return (
    <div className="permission-page">
      <Tabs
        defaultActiveKey="permission"
        activeKey={activeTab}
        onChange={(activeKey) => replace(`${url}/${activeKey}`)}
      >
        <TabPane tab="团队管理" key="teams" />
        <TabPane tab="项目工作单元" key="work-units" />
        <TabPane tab="项目成员" key="users" />
        <TabPane tab="角色与权限" key="permission" />
      </Tabs>
      <main>
        <Switch>
          <Route
            path={`${path}/users`}
            render={() => {
              updateState((draft) => {
                draft.activeTab = "users";
              });
              return <AllUserListPage />;
            }}
          />
          <Route
            path={`${path}/work-units`}
            render={() => {
              updateState((draft) => {
                draft.activeTab = "work-units";
              });
              return <AllWorkUnitListPage />;
            }}
          />
          <Route
            path={`${path}/teams`}
            render={() => {
              updateState((draft) => {
                draft.activeTab = "teams";
              });
              return <TeamSettingsPage />;
            }}
          />
          <Route
            path={`${path}/permission`}
            render={() => {
              updateState((draft) => {
                draft.activeTab = "permission";
              });
              return <RoleSettingsPage />;
            }}
          />
        </Switch>
      </main>
    </div>
  );
}

interface TeamSettingsPageState {
  selectedItemKey: string | null;
}

function TeamSettingsPage() {
  const [{ selectedItemKey }, updateState] = useImmer<TeamSettingsPageState>({
    selectedItemKey: null,
  });
  const { teams } = useRecoilValue(projectPageState);
  const { onTeamNotFound } = useContext(ProjectPageContext);

  const {
    url,
    path,
    isExact,
    params: { projectId },
  } = useRouteMatch<ProjectParams>();

  const history = useHistory();

  // useEffect(() => {
  //   if (isExact) {
  //     history.replace(`${url}/teams`);
  //   }
  // }, [isExact]);

  function setSelectedMenuKey(key: string | null) {
    updateState((draft) => {
      draft.selectedItemKey = key;
    });
  }

  // const selectedAllSection = ["allUsers", "allWorkUnits"].includes(
  //   selectedItemKey ?? "",
  // );
  return (
    <>
      <div className="sidebar">
        <section>
          <div className="title">
            <Iconfont type="icon-changguitubiao-quanbutuandui" />
            团队列表
          </div>
          <ul>
            <li className={!selectedItemKey ? "active" : ""}>
              <Link to={`${url}`}>全部团队</Link>
            </li>
            {teams.map((team) => (
              <li
                key={team.id!}
                className={selectedItemKey === team.id ? "active" : ""}
              >
                <Link to={`${url}/${team.id}`}>{`${team.name}`}</Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="content">
        <Switch>
          <Route
            path={`${path}/:teamId`}
            render={(routeData) => {
              setSelectedMenuKey(routeData.match.params.teamId);
              return <TeamDetailsPage />;
            }}
          />
          <Route
            path={`${path}`}
            render={() => {
              setSelectedMenuKey(null);
              return <TeamListPage />;
            }}
          />
        </Switch>
      </div>
    </>
  );
}
