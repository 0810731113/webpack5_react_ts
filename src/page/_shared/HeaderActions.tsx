import { Avatar, Popover, Space, Tag } from "antd";
import { DeleteOutlined , UserOutlined } from "@ant-design/icons";
import React, { useEffect, useState } from "react";
import { useImmer } from "use-immer";
import { templateService, authService, userService } from "service";
import { useRecoilState, useRecoilValue } from "recoil";
import projectPageState, { userByIdSelector } from "state/project.state";

import consts from "consts";

const { AUTH_BASE_URL, LOGOUT_URL } = consts;

export interface HeaderActionsProps {}

export interface State {}

export default function HeaderActions(props: HeaderActionsProps) {
  const {} = props;
  // const [{}, setState] = useImmer<State>({});

  const [{ templates, currentUser }, setState] = useRecoilState(
    projectPageState,
  );

  const deleteTemplate = (id: string) => {
    templateService.deleteTemplate(id).then(() => {
      refreshState();
    });
  };

  const refreshState = () => {
    templateService.getAllTemplates().then((data) => {
      if (data instanceof Array) {
        setState((pre) => ({
          ...pre,
          templates: data,
        }));
      }
    });
  };

  useEffect(() => {
    refreshState();

    userService.me().then((user) => {
      setState((pre) => ({
        ...pre,
        currentUser: user ?? null,
      }));
    });
  }, []);

  return (
    <div>
      <Space>
        {/* <Tag
          color="#13c2c2"
          style={{
            display: "flex",
            padding: "2px 7px",
            fontSize: 14,
            alignItems: "center",
          }}
        >
          <span
            style={{
              display: "inline-block",
              background: "#fff",
              width: 5,
              height: 5,
              borderRadius: 8,
              marginRight: 6,
            }}
          ></span>{" "}
          2 条未读消息
        </Tag> */}
        <Popover
          trigger="click"
          placement="bottomLeft"
          overlayClassName="header-drop-down"
          content={
            <div className="user-menu">
              <div className="user-info hor-ver-center">
                <span>{`你好，${currentUser?.name}`}</span>
              </div>

              <div className="templete-zone">
                <div className="title">我的初始化模板</div>

                {templates.length > 0 ? (
                  <div className="templete-list">
                    {templates.map((item) => (
                        <div className="item" key={item.id}>
                          <span className="item-name">{item.templateName}</span>
                          <DeleteOutlined
                            onClick={() => deleteTemplate(item.id!)}
                          />
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="empty-text">暂无模板</div>
                )}
              </div>
              <div className="logout-zone">
                <a href={`${AUTH_BASE_URL}/logout?returnTo=${LOGOUT_URL}`}>
                  退出登录
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
            icon={<UserOutlined />}
            size="default"
            gap={20}
           />
        </Popover>
      </Space>
    </div>
  );
}
