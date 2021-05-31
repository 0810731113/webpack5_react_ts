import { Button, message, Popconfirm, Space, Tooltip } from "antd";
import Table, { ColumnType } from "antd/lib/table";
import { UserRoleVO, ProjectVOVisibilityEnum } from "api/generated/model";
import ProjectPageContext from "page/ProjectPage/ProjectPageContext";
import React, { useContext } from "react";
import { useRecoilValue, useRecoilState } from "recoil";
import { teamService, projectService } from "service";
import projectPageState from "state/project.state";
import ProjectRolesName from "page/ProjectPage/_components/ProjectRoleName";
import { CheckPermission } from "component/CheckPermission/CheckPermission";
import { ResourcePermissionResourceEnum } from "api-authorization/generated/model";
import { TooltipWrapper } from "component/wrapper/TooltipWrapper";
import { PopconfirmWrapper } from "component/wrapper/PopconfirmWrapper";

export interface UserListProps {
  teamId?: string;
  projectId?: string;
  users: UserRoleVO[];
  onViewUser?: (userId: string) => void;
  onDeleteUser?: () => void;
}

export interface State {}

export default function UserList({
  teamId,
  projectId,
  users,
  onDeleteUser,
  onViewUser,
}: UserListProps) {
  const { onResponseError, onUserNotFound } = useContext(ProjectPageContext);
  const [{ project, currentUser }] = useRecoilState(projectPageState);
  const columns: ColumnType<UserRoleVO>[] = [
    {
      title: "成员姓名",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "手机号码",
      dataIndex: "telephone",
      key: "telephone",
      render(row, record) {
        return project?.visibility === ProjectVOVisibilityEnum.Global ? "-" : row;
      },
    },
    {
      title: "角色",
      dataIndex: "roleTypes",
      render(row, record) {
        return <ProjectRolesName roles={row} />;
      },
    },
    {
      title: "操作",
      key: "actions",
      render(row, record) {
        return (
          <Space>
            <CheckPermission
              resouseType={ResourcePermissionResourceEnum.CollaborationSetting}
            >
              <TooltipWrapper
                when={(props) => props.disabled ?? false}
                title="处于示例项目中无该功能权限"
              >
                <Button
                  type="link"
                  onClick={() => onViewUser && onViewUser(record.id!)}
                >
                  修改角色
                </Button>
              </TooltipWrapper>
            </CheckPermission>
            <CheckPermission
              resouseType={ResourcePermissionResourceEnum.CollaborationSetting}
            >
              <TooltipWrapper
                when={(props) => props.disabled ?? false}
                title="处于示例项目中无该功能权限"
              >
                {row?.id === project?.owner &&
                currentUser?.isPersonalAccount ? (
                  <Tooltip title="暂不支持移除项目创建者">
                    <Button type="link" disabled>
                      移除
                    </Button>
                  </Tooltip>
                ) : (
                  <PopconfirmWrapper
                    title="确认移除成员？"
                    okButtonProps={{ type: "primary", danger: true }}
                    onConfirm={() => {
                      if (teamId) {
                        teamService
                          .deleteUserFromTeam(record.id!, teamId)
                          .then(() => {
                            message.success("成员已经移除");
                            onUserNotFound("");
                            onDeleteUser?.();
                          })
                          .catch(onResponseError);
                      } else if (projectId) {
                        projectService
                          .deleteUserFromProject(record.id!, projectId)
                          .then(() => {
                            message.success("成员已经移除");
                            onUserNotFound("");
                            onDeleteUser?.();
                          })
                          .catch(onResponseError);
                      } else {
                        alert("error no projectId nor teamId");
                      }
                    }}
                  >
                    <Button type="link">移除</Button>
                  </PopconfirmWrapper>
                )}
              </TooltipWrapper>
            </CheckPermission>
          </Space>
        );
      },
    },
  ];
  return <Table columns={columns} dataSource={users} pagination={false} />;
}
