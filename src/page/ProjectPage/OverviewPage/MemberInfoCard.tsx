import React, { useEffect, useState, PropsWithChildren } from "react";
import { Switch, Route, useRouteMatch } from "react-router";
import { Link } from "react-router-dom";
import { ProjectParams } from "model/route-params.model";
import { DownOutlined, UpOutlined } from "@ant-design/icons";
import { Button, Typography, Avatar } from "antd";
import { useImmer } from "use-immer";
import { roleService } from "service";
import { ProjectRole } from "service/role.service";
import { useRecoilState, useRecoilValue } from "recoil";
import projectPageState, { userByIdSelector } from "state/project.state";
import Scrollbar from "component/Scrollbar/Scrollbar";

const Toggle = (
  props: PropsWithChildren<{ title: string; wrapStyle?: React.CSSProperties }>,
) => {
  const [visible, setVisible] = useState(true);

  return (
    <div style={props.wrapStyle}>
      <div className="gdc-toggle" onClick={() => setVisible(!visible)}>
        {visible ? <DownOutlined /> : <UpOutlined />}
        <span style={{ marginLeft: 8 }}>{props.title}</span>
      </div>
      {visible ? props.children : null}
    </div>
  );
};

interface MemberInfoCardProps {}

interface State {
  designUserIds: string[];
  adminUserIds: string[];
}

export default function MemberInfoCard(props: MemberInfoCardProps) {
  const {} = props;
  const [{ designUserIds, adminUserIds }, updateState] = useImmer<State>({
    designUserIds: [],
    adminUserIds: [],
  });
  const [{ users }] = useRecoilState(projectPageState);
  const {
    url,
    path,
    params: { projectId },
  } = useRouteMatch<ProjectParams>();

  useEffect(() => {
    const p1 = roleService.getProjectUsersByRole(
      projectId,
      ProjectRole.ProjectAdmin,
    );
    const p2 = roleService.getProjectUsersByRole(
      projectId,
      ProjectRole.ProjectUser,
    );

    Promise.all([p1, p2]).then((_data) => {
      updateState((draft) => {
        draft.adminUserIds = _data[0] ?? [];
        draft.designUserIds = _data[1] ?? [];
      });
    });
  }, []);

  return (
    <div className="member-info card">
      <div className="card-title">
        <span>项目成员</span>
        <Link to={`/projects/${projectId}/settings/collaboration/users`}>
          <Button>查看详情</Button>
        </Link>
      </div>
      <Scrollbar autoHeight autoHeightMax={372} style={{ marginBottom: 12 }}>
        <div className="card-body">
          <Toggle title="项目管理员">
            {adminUserIds.map((_id) => {
              const user = users.find((_user) => _user.id === _id);

              return (
                <div className="member-line" key={_id}>
                  <Avatar src={user?.avatarPath} size={24} />
                  <Typography.Text
                    style={{
                      width: "100%",
                      // flex: "none",
                      overflow: "scroll",
                      marginBottom: -4,
                      marginLeft: 8,
                    }}
                    ellipsis={{ tooltip: true }}
                  >
                    {user?.name}
                  </Typography.Text>
                </div>
              );
            })}
          </Toggle>
          <Toggle title="设计师" wrapStyle={{ marginTop: 24 }}>
            {designUserIds.map((_id) => {
              const user = users.find((_user) => _user.id === _id);

              return (
                <div className="member-line" key={_id}>
                  <Avatar src={user?.avatarPath} size={24} />

                  <Typography.Text
                    style={{
                      width: "100%",
                      // flex: "none",
                      overflow: "scroll",
                      marginBottom: -6,
                      marginLeft: 8,
                    }}
                    ellipsis={{ tooltip: true }}
                  >
                    {user?.name}
                  </Typography.Text>
                </div>
              );
            })}
          </Toggle>
        </div>
      </Scrollbar>
    </div>
  );
}
