import { Drawer, Space, Button, TreeSelect } from "antd";
import { User } from "api/generated/model";
import { ProjectParams } from "model/route-params.model";
import { Switch, Route, useRouteMatch } from "react-router";
import { DataNode, EventDataNode } from "rc-tree/lib/interface";
import React, { useEffect, useContext } from "react";
import { userService, roleService } from "service";
import { useImmer } from "use-immer";
import { defaultDrawerSettings } from "consts";
import { RoleName, ProjectRole } from "service/role.service";
import ProjectPageContext from "page/ProjectPage/ProjectPageContext";

export interface Props {
  userId: string;
  visible: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export interface State {
  user: User | null;
  values: ProjectRole[];
  treeData?: DataNode[];
}

export default function (props: Props) {
  const { userId, visible, onClose, onComplete } = props;
  const {
    url,
    path,
    params: { projectId },
  } = useRouteMatch<ProjectParams>();

  const { onTeamNotFound, onResponseError } = useContext(ProjectPageContext);

  const [{ user, values, treeData }, updateState] = useImmer<State>({
    user: null,
    values: [ProjectRole.ProjectUser],
    treeData: [],
  });

  const formTreeData = (currentRole: ProjectRole[]) => {
    const roles = [
      ProjectRole.ProjectAdmin,
      ProjectRole.ProjectUser,
    ];

    const onlyRole = currentRole.length === 1 ? currentRole[0] : false;

    const data = [];
    for (let i = 0; i < roles.length; i++) {
      data.push({
        label: RoleName[roles[i]],
        value: roles[i],
        key: roles[i],
        disableCheckbox: onlyRole && onlyRole === roles[i],
      });
    }

    return data;
  };

  useEffect(() => {
    if (userId) {
      userService.getUser(userId).then((_user) => {
        updateState((draft) => {
          draft.user = _user ?? null;
        });
      });

      roleService.getUserRoleByProjectId(projectId, userId).then((roles) => {
        updateState((draft) => {
          draft.values = roles;
          draft.treeData = formTreeData(roles);
        });
      });
    }
  }, [userId]);

  if (!user) {
    return null;
  }

  const editRole = () => {
    roleService
      .editUserRole(projectId, values, userId)
      .then(() => {
        onClose();
        onComplete();
      })
      .catch(onResponseError);
  };

  return (
    <Drawer
      title="成员权限"
      visible={visible}
      onClose={onClose}
      width={480}
      {...defaultDrawerSettings}
      footer={
        <div style={{ textAlign: "right" }}>
          <Space>
            <Button onClick={editRole}>保存</Button>
          </Space>
        </div>
      }
    >
      <div>{user.name}</div>
      <TreeSelect
        defaultOpen
        removeIcon={null}
        value={values}
        style={{ width: "100%" }}
        placeholder="选择角色"
        treeCheckable
        treeData={treeData}
        onChange={(value) => {
          if (value instanceof Array && value.length > 0) {
            updateState((draft) => {
              draft.values = value;
              draft.treeData = formTreeData(value);
            });
          }
        }}
      />
    </Drawer>
  );
}
