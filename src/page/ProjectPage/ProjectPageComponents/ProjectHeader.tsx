import {
  ArrowRightOutlined,
  ExclamationCircleFilled,
  CheckCircleFilled,
} from "@ant-design/icons";
import { Button, Divider, Modal, Space, Tooltip } from "antd";
import HeaderActions from "page/_shared/HeaderActions";
import consts from "consts";
import HeaderLogo from "page/_shared/HeaderLogo";
import React, { ReactNode, useEffect } from "react";
import { Link } from "react-router-dom";
import { useRecoilValue } from "recoil";
import projectPageState from "state/project.state";
import useCheckMaintenance from "hook/use-check-maintenance.hook";
import { SystemStatusMaintainStatusEnum } from "api-system/generated/model";
import UserInfo from "page/_shared/UserInfo";
import { useImmer } from "use-immer";
import { publishEvent } from "function/stats.func";
import SupportAndServiceModal from "../WorkspacePage/SupportAndServiceModal";

interface ProjectHeaderState {
  feedbackModalVisible: boolean;
  supportAndServiceVisible: boolean;
}
interface ProjectHeaderProps {
  title?: string | ReactNode;
  needBack: boolean;
}

export default function ProjectHeader(props: ProjectHeaderProps) {
  const { title, needBack } = props;
  const { NESTBIM_BASE_URL } = consts;
  const { project } = useRecoilValue(projectPageState);

  const { status: sysStatus, message } = useCheckMaintenance("WEB");
  const [
    { feedbackModalVisible, supportAndServiceVisible },
    update,
  ] = useImmer<ProjectHeaderState>({
    feedbackModalVisible: false,
    supportAndServiceVisible: false,
  });
  useEffect(() => {
    if (feedbackModalVisible) {
      publishEvent(`feedback`, ["基础"], { eventLevel: "P2" });
    }
  }, [feedbackModalVisible]);

  return (
    <header className="page-header">
      <div className="header-logo">
        <Space>
          <HeaderLogo />
          <Divider type="vertical" />
          {needBack ? (
            <Space>
              <Link to="/workspace?viewType=personal">个人工作台</Link>
              <ArrowRightOutlined />
              <span>{title ?? project?.name}</span>
            </Space>
          ) : (
            <span>{title}</span>
          )}
        </Space>
        <Space className="header-buttons">
          <Button
            type="link"
            className="header-button"
            onClick={() =>
              void update((draft) => {
                draft.supportAndServiceVisible = true;
              })
            }
          >
            支持与服务
          </Button>
          <Button
            type="link"
            className="header-button"
            onClick={() =>
              void update((draft) => {
                draft.feedbackModalVisible = true;
              })
            }
          >
            意见反馈
          </Button>
        </Space>
      </div>

      {sysStatus !== SystemStatusMaintainStatusEnum.Running && (
        <div className="anno">
          <div className="tip-fixed">
            {sysStatus === SystemStatusMaintainStatusEnum.PreMaintenance && (
              <Tooltip title={message} trigger="hover" placement="bottom">
                <ExclamationCircleFilled style={{ color: "#faad14" }} />
              </Tooltip>
            )}
            {sysStatus === SystemStatusMaintainStatusEnum.PostMaintain && (
              <Tooltip title={message} trigger="hover" placement="bottom">
                <CheckCircleFilled style={{ color: "#36cfc9" }} />
              </Tooltip>
            )}
          </div>
          <div className="marquee">
            <div className="text">{message}</div>
          </div>
        </div>
      )}

      <UserInfo />
      <Modal
        title="意见反馈"
        width={576}
        closable
        footer={false}
        visible={feedbackModalVisible}
        destroyOnClose
        onCancel={() =>
          void update((draft) => {
            draft.feedbackModalVisible = false;
          })
        }
      >
        <iframe
          title="意见反馈"
          src={`${NESTBIM_BASE_URL}/external/feedback?platform=gdcp`}
          style={{
            border: "none",
            width: "100%",
            height: 440,
          }}
        />
      </Modal>
      <SupportAndServiceModal
        visible={!!supportAndServiceVisible}
        onCancel={() =>
          update((draft) => {
            draft.supportAndServiceVisible = false;
          })
        }
      />
    </header>
  );
}
