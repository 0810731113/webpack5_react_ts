import React, { useEffect } from "react";
import { Switch, Route, useRouteMatch } from "react-router";
import { ProjectParams } from "model/route-params.model";
import { Link } from "react-router-dom";
import { useImmer } from "use-immer";
import { Spin, Space, Button } from "antd";

import consts from "consts";

const { PUBLIC_URL, AUTH_BASE_URL, LOGOUT_URL } = consts;

interface ForbiddenPageProps {}

interface State {}

export default function ForbiddenPage(props: ForbiddenPageProps) {
  const {} = props;
  const [{}, updateState] = useImmer<State>({});
  const {
    url,
    path,
    params: { projectId },
  } = useRouteMatch<ProjectParams>();

  useEffect(() => {}, []);

  return (
    <div
      id="root"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Space align="center" size={70}>
        <img
          src={`${PUBLIC_URL}/forbidden.png`}
          style={{ width: 300, marginTop: 50 }}
        />
        <Space direction="vertical" size={25}>
          <h1>内测中，敬请期待。。。</h1>
          <Button
            type="primary"
            href={`${AUTH_BASE_URL}/logout?returnTo=${LOGOUT_URL}`}
          >
            返回首页
          </Button>
        </Space>
      </Space>
    </div>
  );
}
