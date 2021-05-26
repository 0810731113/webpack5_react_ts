import {
  ArrowRightOutlined,
  ExclamationCircleFilled,
  CheckCircleFilled,
} from "@ant-design/icons";
import { Space, Tooltip } from "antd";
import HeaderActions from "page/_shared/HeaderActions";
import HeaderLogo from "page/_shared/HeaderLogo";
import React, { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useRecoilValue } from "recoil";
import projectPageState from "state/project.state";
import consts from "consts";
import { IsPC } from "function/common.func";

const { AUTH_BASE_URL, LOGOUT_URL, PUBLIC_URL } = consts;
interface SystemHeaderProps {
  title?: ReactNode;
  userId?: string;
  succeeded?: boolean;
}

export default function SystemHeader(props: SystemHeaderProps) {
  const { title, userId, succeeded } = props;
  return (
    <header
      className={["page-header", succeeded ? "succeeded" : ""].join(" ")}
      style={{ height: 72, minHeight: 72, maxHeight: 72 }}
    >
      <div className="header-logo">
        <Space size={40}>
          <img src={`${PUBLIC_URL}/design_logo.png`} style={{ height: 40 }} />
          {IsPC() ? (
            <div style={{ fontSize: 16 }}>
              <span>{title}</span>
              {/* <span>（名额有限）</span> */}
            </div>
          ) : (
            succeeded && (
              <div style={{ fontSize: 16 }}>
                <span>欢迎申请广联达设计试用资格</span>
                <div
                  style={{
                    opacity: 0.45,
                    fontSize: 12,
                    color: "rgba(0, 0, 0, 0.85)",
                    marginTop: 8,
                  }}
                >
                  名额有限，赶快申请吧
                </div>
              </div>
            )
          )}
        </Space>
      </div>

      {/* <Space>
        {userId}
        <Button
          type="primary"
          href={`${AUTH_BASE_URL}/logout?returnTo=${LOGOUT_URL}`}
        >
          退出登录
        </Button>
      </Space> */}
    </header>
  );
}
