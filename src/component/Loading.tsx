import { LoadingOutlined } from "@ant-design/icons";
import { Spin, Space } from "antd";
import classNames from "classnames";
import React, { useEffect } from "react";
import { useImmer } from "use-immer";
import "./Loading.scss";

export interface LoadingProps {
  delay?: number;
  size?: number;
  message?: string;
  absolute?: boolean;
}

export interface LoadingState {
  timeout: boolean;
}

export default function Loading(props: LoadingProps) {
  const { delay, size, absolute, message } = props;
  const [{ timeout }, updateState] = useImmer<LoadingState>({ timeout: false });
  const antIcon = <LoadingOutlined style={{ fontSize: size ?? 24 }} spin />;

  useEffect(() => {
    const timeout = setTimeout(() => {
      updateState((draft) => {
        draft.timeout = true;
      });
    }, delay ?? 200);
    return () => clearTimeout(timeout);
  }, [delay, size]);

  if (!timeout) {
    return null;
  }

  const className = classNames({
    "loading-container": true,
    abs: absolute,
  });
  return (
    <div className={className}>
      <Space direction="vertical">
        <Spin indicator={antIcon} />
        {message && <p>{message}</p>}
      </Space>
    </div>
  );
}
