/* eslint-disable @typescript-eslint/no-use-before-define */
import { message, Popconfirm, Space, Tag, Button, Table } from "antd";
import { ColumnType } from "antd/es/table/interface";
import { Team } from "api/generated/model";
import useTeamUsers from "hook/use-team-users.hook";
import ProjectPageContext from "page/ProjectPage/ProjectPageContext";
import React, { useContext } from "react";
import { useRouteMatch } from "react-router";
import { Link } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { teamService } from "service";
import projectPageState from "state/project.state";
import { useImmer } from "use-immer";
import { CheckPermission } from "component/CheckPermission/CheckPermission";
import { ResourcePermissionResourceEnum } from "api-authorization/generated/model";
import { TooltipWrapper } from "component/wrapper/TooltipWrapper";
import { PopconfirmWrapper } from "component/wrapper/PopconfirmWrapper";
import AddTeamDrawer from "./components/AddTeamDrawer";

export interface TeamListPageProps {}

export interface State {
  showAddTeamForm: boolean;
  selectedTeamId?: string | null;
}

export default function TeamListPage(props: TeamListPageProps) {
  const {} = props;
  const [{ showAddTeamForm, selectedTeamId }, updateState] = useImmer<State>({
    showAddTeamForm: false,
  });
  const {
    url,
    path,
    params: {},
  } = useRouteMatch<{}>();
  const { onTeamNotFound, onResponseError } = useContext(ProjectPageContext);
  const { teams } = useRecoilValue(projectPageState);
  const columns: ColumnType<Team>[] = [
    {
      title: "团队名称",
      dataIndex: "name",
      key: "name",
      render(row, record) {
        return <Link to={`${url}/${record.id}`}>{record.name}</Link>;
      },
    },
    {
      title: "成员",
      key: "users",
      render(row, record) {
        return <TeamMemberList teamId={record.id!} />;
      },
    },
    {
      title: "操作",
      key: "operation",
      render(row, record) {
        return (
          <Space>
            <CheckPermission
              resouseType={ResourcePermissionResourceEnum.CollaborationSetting}
            >
              <TooltipWrapper
                when={(tooltipProps) => tooltipProps.disabled ?? false}
                title="处于示例项目中无该功能权限"
              >
                <Button
                  type="link"
                  onClick={() => {
                    updateState((draft) => {
                      draft.selectedTeamId = record.id;
                      draft.showAddTeamForm = true;
                    });
                  }}
                >
                  编辑
                </Button>
              </TooltipWrapper>
            </CheckPermission>
            <CheckPermission
              resouseType={ResourcePermissionResourceEnum.CollaborationSetting}
            >
              <TooltipWrapper
                when={(tooltipProps) => tooltipProps.disabled ?? false}
                title="处于示例项目中无该功能权限"
              >
                <PopconfirmWrapper
                  title="确认删除团队吗？"
                  okButtonProps={{ danger: true, type: "primary" }}
                  onConfirm={() => {
                    teamService
                      .deleteTeam(record.id!)
                      .then(() => {
                        message.success("团队已经删除");
                        onTeamNotFound("");
                      })
                      .catch(onResponseError);
                  }}
                >
                  <Button type="link">删除</Button>
                </PopconfirmWrapper>
              </TooltipWrapper>
            </CheckPermission>
          </Space>
        );
      },
    },
  ];
  return (
    <div>
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
              onClick={() =>
                updateState((draft) => {
                  draft.selectedTeamId = null;
                  draft.showAddTeamForm = true;
                })
              }
            >
              创建团队
            </Button>
          </TooltipWrapper>
        </CheckPermission>
      </div>
      <Table
        columns={columns}
        dataSource={teams}
        pagination={false}
        rowKey={(record) => record.id ?? ""}
      />
      {showAddTeamForm && (
        <AddTeamDrawer
          teamId={selectedTeamId}
          editMode={!!selectedTeamId}
          visible={showAddTeamForm}
          onClose={() => {
            updateState((draft) => {
              draft.showAddTeamForm = false;
            });
          }}
          onComplete={() => {
            onTeamNotFound("");
            updateState((draft) => {
              draft.showAddTeamForm = false;
            });
          }}
        />
      )}
    </div>
  );
}

function TeamMemberList({ teamId }: { teamId: string }) {
  const { users } = useTeamUsers(teamId);
  if (!users) {
    return null;
  }
  return (
    <>
      {users.map((user) => (
        <Tag key={user.id}>{user.name}</Tag>
      ))}
    </>
  );
}
