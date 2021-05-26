import { Button, Result } from "antd";
import React from "react";
import { Link } from "react-router-dom";

export interface NotFoundPageProps {}

export interface State {}

export default function NotFoundPage(props: NotFoundPageProps) {
  const {} = props;

  return (
    <Result
      status="404"
      title="404"
      subTitle="Sorry, the page you visited does not exist."
      extra={
        <Link to="/workspace">
          <Button type="primary">返回首页</Button>
        </Link>
      }
    />
  );
}
