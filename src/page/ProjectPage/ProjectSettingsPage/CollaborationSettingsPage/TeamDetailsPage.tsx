import { useRequest, useUpdate } from "@umijs/hooks";
import { Divider } from "antd";
import { Team, User } from "api/generated/model";
import { Button, Descriptions, DescriptionsItem } from "component/Antd";
import Loading from "component/Loading";
import useTeamUsers from "hook/use-team-users.hook";
import useTeamWorkUnits from "hook/use-team-workunits.hook";
import React, { useEffect, useContext } from "react";
import { useRouteMatch } from "react-router";
import { teamService, userService } from "service";
import { ProjectTeamParams } from "three-engine/model/route-params.model";
import { useImmer } from "use-immer";
import { CheckPermission } from "component/CheckPermission/CheckPermission";
import { publishEvent } from "function/stats.func";
import { ResourcePermissionResourceEnum } from "api-authorization/generated/model";
import { TooltipWrapper } from "component/wrapper/TooltipWrapper";
import ProjectPageContext from "page/ProjectPage/ProjectPageContext";
import AddWorkUnitDrawer from "./components/AddWorkUnitDrawer";
import UserDetailsDrawer from "./components/UserDetailsDrawer";
import UserList from "./components/UserList";
import WorkUnitDetailsDrawer from "./components/WorkUnitDetailsDrawer";
import WorkUnitList from "./components/WorkUnitList";
import EditUserDrawer from "./components/EditUserDrawer";
import AddEnterpriseUserDrawer from "./components/AddEnterpriseUserDrawer";

export interface TeamDetailsPageProps {}

export interface State {
  team: Team | null;
  users: User[];
  selectedUserId: string | null;
  selectedWorkUnitId: string | null;
  showAddUser?: boolean;
  showAddWorkUnit?: boolean;
  version: number;
}

function TeamMemberList({
  visible,
  projectId,
  teamId,
  projectUsers,
  onViewUser,
  onClose,
  refreshProjectUsers,
  version,
}: {
  visible: boolean;
  teamId: string;
  projectId: string;
  version: number;
  projectUsers: User[];
  onClose: () => void;
  refreshProjectUsers: () => void;
  onViewUser(userId: string): void;
}) {
  // const { users, run } = useTeamUsers(teamId);
  const { onTeamNotFound, onResponseError } = useContext(ProjectPageContext);

  const { loading, data: users, run } = useRequest(
    () =>
      teamService
        .getRoleUsersInTeams(projectId, teamId)
        .then((newUsers) => newUsers ?? []),
    { manual: true },
  );

  useEffect(() => void run(), [version, teamId]);

  return (
    <>
      <UserList
        teamId={teamId}
        users={users ?? []}
        onViewUser={onViewUser}
        onDeleteUser={() => {
          run();
        }}
      />
      <AddEnterpriseUserDrawer
        projectUsers={projectUsers}
        teamUsers={users ?? []}
        teamId={teamId}
        visible={visible}
        onClose={onClose}
        refreshProjectUsers={refreshProjectUsers}
        onComplete={() => {
          onClose();
          run();
          onTeamNotFound("");
        }}
      />
    </>
  );
}

function TeamWorkUnitList({
  teamId,
  visible,
  version,
  onViewWorkUnit,
  onClose,
}: {
  teamId: string;
  visible: boolean;
  version: number;
  onViewWorkUnit(workUnitId: string): void;
  onClose: () => void;
}) {
  const { workUnits, run } = useTeamWorkUnits(teamId);
  useEffect(() => void run(), [version]);
  return (
    <>
      <WorkUnitList
        workUnits={workUnits || []}
        onDeleted={() => run()}
        onViewWorkUnit={onViewWorkUnit}
      />
      <AddWorkUnitDrawer
        teamId={teamId}
        visible={visible}
        onClose={onClose}
        onComplete={() => {
          onClose();
          run();
        }}
      />
    </>
  );
}

export default function TeamDetailsPage(props: TeamDetailsPageProps) {
  const {} = props;
  const update = useUpdate();
  const [
    {
      team,
      users,
      selectedUserId,
      selectedWorkUnitId,
      showAddUser,
      showAddWorkUnit,
      version,
    },
    updateState,
  ] = useImmer<State>({
    users: [],
    team: null,
    selectedUserId: null,
    selectedWorkUnitId: null,
    version: 0,
  });
  const {
    url,
    path,
    params: { projectId, teamId },
  } = useRouteMatch<ProjectTeamParams>();

  useEffect(() => {
    teamService.getTeamInfo(teamId).then((newTeam) => {
      updateState((draft) => {
        draft.team = newTeam!;
      });
    });
  }, [teamId]);

  const { loading, data, run } = useRequest(
    () =>
      userService.listUsers(projectId).then((newUsers) =>
        updateState((draft) => {
          draft.users = newUsers ?? [];
        }),
      ),
    { manual: true },
  );

  useEffect(() => {
    run();
  }, [projectId]);

  if (!team) {
    return <Loading />;
  }

  return (
    <div>
      <Descriptions
        size="small"
        bordered
        style={{ display: "inline-block", minWidth: 200 }}
      >
        <DescriptionsItem label="团队名称">{team.name}</DescriptionsItem>
        <DescriptionsItem label="团队描述">{team.description}</DescriptionsItem>
      </Descriptions>
      <Divider dashed />
      <div className="split-toolbar">
        <b>团队成员</b>
        <CheckPermission
          resouseType={ResourcePermissionResourceEnum.CollaborationSetting}
        >
          <TooltipWrapper
            when={(tooltipWrapperProps) =>
              tooltipWrapperProps.disabled ?? false
            }
            title="处于示例项目中无该功能权限"
          >
            <Button
              onClick={() => {
                updateState((draft) => {
                  draft.showAddUser = true;
                });
              }}
            >
              添加成员
            </Button>
          </TooltipWrapper>
        </CheckPermission>
      </div>

      <TeamMemberList
        refreshProjectUsers={run}
        visible={showAddUser ?? false}
        projectUsers={users}
        teamId={teamId}
        projectId={projectId}
        version={version}
        onViewUser={(userId) =>
          updateState((draft) => {
            draft.selectedUserId = userId;
          })
        }
        onClose={() => {
          run();
          updateState((draft) => {
            draft.version += 1;
            draft.showAddUser = false;
          });
        }}
      />

      <EditUserDrawer
        visible={!!selectedUserId}
        userId={selectedUserId!}
        onClose={() => {
          updateState((draft) => {
            draft.selectedUserId = null;
          });
        }}
        onComplete={() => {
          run();
          updateState((draft) => {
            draft.version += 1;
          });
        }}
      />
      {/* <UserDetailsDrawer
        visible={!!selectedUserId}
        userId={selectedUserId!}
        onClose={() =>
          updateState((draft) => void (draft.selectedUserId = null))
        }
      /> */}

      <Divider dashed />
      <div className="split-toolbar">
        <b>工作单元</b>
        <CheckPermission
          resouseType={ResourcePermissionResourceEnum.CollaborationSetting}
        >
          <TooltipWrapper
            when={(tooltipWrapperProps) =>
              tooltipWrapperProps.disabled ?? false
            }
            title="处于示例项目中无该功能权限"
          >
            <Button
              onClick={() => {
                publishEvent(`createWorkUnit`, ["项目配置", `协同设置`], {
                  eventLevel: "P1",
                  from: "团队管理页",
                });
                updateState((draft) => {
                  draft.showAddWorkUnit = true;
                });
              }}
            >
              添加工作单元
            </Button>
          </TooltipWrapper>
        </CheckPermission>
      </div>
      <TeamWorkUnitList
        visible={showAddWorkUnit ?? false}
        teamId={teamId}
        version={version}
        onViewWorkUnit={(workUnitId) =>
          updateState((draft) => {
            draft.selectedWorkUnitId = workUnitId;
          })
        }
        onClose={() => {
          updateState((draft) => {
            draft.version += 1;
            draft.showAddWorkUnit = false;
          });
        }}
      />
      <WorkUnitDetailsDrawer
        visible={!!selectedWorkUnitId}
        workUnitId={selectedWorkUnitId!}
        onClose={(refresh) => {
          updateState((draft) => {
            draft.selectedWorkUnitId = null;
            if (refresh) {
              draft.version += 1;
            }
          });
        }}
      />
    </div>
  );
}
