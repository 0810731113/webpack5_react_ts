import { User } from "api/generated/model";
import { ProjectParams } from "model/route-params.model";
import React, { useEffect } from "react";
import { useRouteMatch } from "react-router";
import { userService } from "service";
import { useImmer } from "use-immer";
import { useRequest } from "@umijs/hooks";
import Loading from "component/Loading";
import { Space, Button } from "antd";
import { CheckPermission } from "component/CheckPermission/CheckPermission";
import { ResourcePermissionResourceEnum } from "api-authorization/generated/model";
import { TooltipWrapper } from "component/wrapper/TooltipWrapper";
import AddEnterpriseUserDrawer from "./components/AddEnterpriseUserDrawer";
import EditUserDrawer from "./components/EditUserDrawer";
import UserList from "./components/UserList";
import UserDetailsDrawer from "./components/UserDetailsDrawer";

export interface AllUserListPageProps {}

export interface State {
  users: User[] | null;
  selectedUserId: string | null;
  showAddUser?: boolean;
}

export default function AllUserListPage(props: AllUserListPageProps) {
  const {} = props;
  const {
    url,
    path,
    params: { projectId },
  } = useRouteMatch<ProjectParams>();
  const [{ users, selectedUserId, showAddUser }, updateState] = useImmer<State>(
    {
      users: null,
      selectedUserId: null,
    },
  );

  const { loading, data, run } = useRequest(
    () =>
      userService.listProjectRoleUsers(projectId).then((_users) =>
        updateState((draft) => {
          draft.users = _users ?? [];
        }),
      ),
    { manual: true },
  );

  useEffect(() => {
    run();
  }, [projectId]);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="content">
      <div className="split-toolbar">
        <CheckPermission
          resouseType={ResourcePermissionResourceEnum.CollaborationSetting}
        >
          <TooltipWrapper
            when={(tooltipProps) => tooltipProps.disabled ?? false}
            title="处于示例项目中无该功能权限"
          >
            <Button
              type="primary"
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
        {/* <span style={{ visibility: "hidden" }}>全部团队成员</span> */}
      </div>
      <UserList
        users={users ?? []}
        projectId={projectId}
        onViewUser={(userId) => {
          updateState((draft) => {
            draft.selectedUserId = userId;
          });
        }}
        onDeleteUser={() => run()}
      />
      {/* <UserDetailsDrawer
        visible={!!selectedUserId}
        userId={selectedUserId!}
        onClose={() =>
          updateState((draft) => void (draft.selectedUserId = null))
        }
      /> */}

      <EditUserDrawer
        visible={!!selectedUserId}
        userId={selectedUserId!}
        onClose={() => {
          updateState((draft) =>  {draft.selectedUserId = null});
        }}
        onComplete={() => {
          run();
        }}
      />
      <AddEnterpriseUserDrawer
        visible={showAddUser ?? false}
        projectUsers={users ?? []}
        onClose={() => {
          updateState((draft) => {
            draft.showAddUser = false;
          });
        }}
        onComplete={() => {
          run();
        }}
      />
    </div>
  );
}
