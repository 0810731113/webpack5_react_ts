import {
  Avatar,
  Popover,
  Space,
  Button,
  Modal,
  Switch,
  Typography,
  message,
} from "antd";
import React, { useEffect, useState } from "react";
import {
  templateService,
  authService,
  userService,
  projectService,
  loginService,
} from "service";
import { onResponseError } from "function/auth.func";
import { useRecoilState, useRecoilValue } from "recoil";
import projectPageState, { userByIdSelector } from "state/project.state";
import { UserOutlined } from "@ant-design/icons";
import consts from "consts";
import { useImmer } from "use-immer";
import { setCookie } from "function/cookie.func";

const { AUTH_BASE_URL, LOGOUT_URL } = consts;

export interface UserInfoProps {}

export interface State {
  accountSetVisible: boolean;
  isParticipant: boolean;
  loading: boolean;
  refresh: boolean;
}

export default function UserInfo(props: UserInfoProps) {
  const {} = props;
  const [
    { accountSetVisible, isParticipant, loading, refresh },
    update,
  ] = useImmer<State>({
    accountSetVisible: false,
    isParticipant: false,
    loading: false,
    refresh: false,
  });

  const [{ currentUser }, setState] = useRecoilState(projectPageState);

  useEffect(() => {
    userService.me().then((user) => {
      setState((pre) => ({
        ...pre,
        currentUser: user ?? null,
      }));
      setCookie("isPersonalAccount", user?.isPersonalAccount ? "1" : "0");
    });
  }, [refresh]);
  useEffect(() => {
    if (currentUser) {
      update((draft) => {
        draft.isParticipant = !!currentUser.isProjectParticipant;
      });
    }
  }, [currentUser]);

  return (
    <div>
      <Space>
        <Popover
          trigger="click"
          placement="bottomLeft"
          overlayClassName="userinfo-dropdown"
          content={
            <div className="user-menu">
              <div className="user-info">
                <div className="avatar">
                  <img src={currentUser?.avatarPath} />
                </div>
                <div className="name">
                  <div>{currentUser?.name}</div>
                </div>
              </div>

              <div className="logout-zone">
                {currentUser?.isMainAccount && (
                  <Button
                    onClick={() =>
                      update((draft) => {
                        draft.accountSetVisible = true;
                      })
                    }
                  >
                    账号设置
                  </Button>
                )}
                <a
                  href={`${AUTH_BASE_URL}/web/userinfo`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Button>修改信息</Button>
                </a>
                <a onClick={() => loginService.logout()}>
                  <Button>退出登录</Button>
                </a>
              </div>
            </div>
          }
        >
          <Avatar
            style={{
              backgroundColor: "tomato",
              verticalAlign: "middle",
              cursor: "pointer",
            }}
            shape="square"
            src={currentUser?.avatarPath}
            icon={<UserOutlined />}
            size="small"
            gap={20}
          />
        </Popover>
      </Space>
      <Modal
        title="账号设置"
        visible={accountSetVisible}
        okText="保存"
        okButtonProps={{
          disabled: isParticipant === currentUser?.isProjectParticipant,
          loading,
        }}
        onCancel={() =>
          update((draft) => {
            draft.accountSetVisible = false;
          })
        }
        onOk={async () => {
          update((draft) => {
            draft.loading = true;
          });
          try {
            await projectService.updateParticipant(isParticipant);
            message.success("修改权限成功");
            update((draft) => {
              draft.accountSetVisible = false;
              draft.refresh = !refresh;
            });
          } catch (e) {
            const messages = e.message.split("message: ");
            message.error(messages.pop());
            update((draft) => {
              draft.isParticipant = !isParticipant;
            });
          } finally {
            update((draft) => {
              draft.loading = false;
            });
          }
        }}
      >
        <div style={{ display: "flex" }}>
          <Switch
            style={{ marginRight: 8 }}
            checked={isParticipant}
            onChange={() =>
              update((draft) => {
                draft.isParticipant = !isParticipant;
              })
            }
          />
          <div>
            <Typography.Title level={5} style={{ fontWeight: "normal" }}>
              允许企业账号参与项目
            </Typography.Title>
            <Typography.Paragraph
              style={{ color: "rgba(0, 0, 0, 0.25)", fontSize: 12 }}
            >
              开启权限后，创建项目时企业账号会自动以管理员身份加入项目，
              关闭权限后，“我参与的”标签页会被锁上，但您仍然可以以只读
              身份加入项目查看
            </Typography.Paragraph>
          </div>
        </div>
      </Modal>
    </div>
  );
}
