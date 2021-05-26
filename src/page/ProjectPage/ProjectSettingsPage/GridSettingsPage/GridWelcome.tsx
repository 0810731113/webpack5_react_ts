import React, { useEffect } from "react";
import { Switch, Route, useRouteMatch } from "react-router";
import { ProjectParams } from "model/route-params.model";
import { Link, useHistory } from "react-router-dom";
import { CheckCircleOutlined } from "@ant-design/icons";
import { Button, Checkbox, Select, Tabs, message, Modal, Divider } from "antd";
import consts from "consts";
import { useImmer } from "use-immer";
import { CheckPermission } from "component/CheckPermission/CheckPermission";
import { publishEvent } from "function/stats.func";
import {
  ResourcePermissionResourceEnum,
  ResourcePermissionPermissionTypesEnum,
} from "api-authorization/generated/model";

const { PUBLIC_URL } = consts;

interface GridWelcomeProps {}

interface State {}

export default function GridWelcome(props: GridWelcomeProps) {
  const {} = props;
  const [{}, updateState] = useImmer<State>({});
  const {
    url,
    path,
    params: { projectId },
  } = useRouteMatch<ProjectParams>();

  const history = useHistory();

  useEffect(() => {}, []);

  const toPage = (subpage: string) => {
    // publishEvent("轴网绘制体验", { 入口选择: subpage });
    history.replace(`${url.split("/welcome")[0]}/${subpage}`);
  };

  return (
    <div className="grid-route-page">
      <div className="body">
        <div className="intro">
          广联达协同设计平台提供了两种轴网绘制方式，由于数据不兼容，您需要选定一种方式后再正式开始项目：
        </div>
        <div className="intro-card">
          <div className="info-area">
            <div className="info-title">
              <img src={`${PUBLIC_URL}/gdcp_logo.png`} />
              <Divider type="vertical" />
              <span>使用平台绘制</span>
            </div>

            <div className="info-body">
              <li>
                <CheckCircleOutlined />
                全员在线预览
              </li>
              <li>
                <CheckCircleOutlined />
                支持正交轴网、多套轴网绘制
              </li>
              <li>
                <CheckCircleOutlined />
                自由轴线绘制
              </li>
              <li>
                <CheckCircleOutlined />
                批量创建轴网
              </li>
            </div>

            <div className="info-footer">
              <span />
              <CheckPermission
                resouseType={ResourcePermissionResourceEnum.ProjectSetting}
                writeCondition={(rights) =>
                  rights?.includes(
                    ResourcePermissionPermissionTypesEnum.SoftWrite,
                  ) ?? false
                }
              >
                <Button type="primary" onClick={() => toPage("gdcp")}>
                  选择
                </Button>
              </CheckPermission>
            </div>
          </div>

          <div className="gif-area">
            <img src={`${PUBLIC_URL}/gdcp.gif`} />
          </div>
        </div>
        <div className="intro-card">
          <div className="info-area">
            <div className="info-title">
              <img src={`${PUBLIC_URL}/garch_logo.png`} />
              <Divider type="vertical" />
              <span>使用软件绘制</span>
            </div>

            <div className="info-body">
              <li>
                <CheckCircleOutlined />
                支持正交轴网、多套轴网、辐射轴网
              </li>
              <li>
                <CheckCircleOutlined />
                自由轴线绘制
              </li>
              <li>
                <CheckCircleOutlined />
                批量创建轴网、批量对齐
              </li>
              <li>
                <CheckCircleOutlined />
                支持轴线弯头、轴号重排
              </li>
              <li>
                <CheckCircleOutlined />
                轴线自动标注
              </li>
            </div>
            <div className="info-footer">
              <a
                href={`${PUBLIC_URL}/download?software=garch`}
                target="_blank"
                rel="noreferrer"
              >
                <Button type="link">点击下载</Button>
              </a>
              <CheckPermission
                resouseType={ResourcePermissionResourceEnum.ProjectSetting}
                writeCondition={(rights) =>
                  rights?.includes(
                    ResourcePermissionPermissionTypesEnum.SoftWrite,
                  ) ?? false
                }
              >
                <Button type="primary" onClick={() => toPage("garch")}>
                  选择
                </Button>
              </CheckPermission>
            </div>
          </div>

          <div className="gif-area">
            <img src={`${PUBLIC_URL}/garch.gif`} />
          </div>
        </div>
      </div>
    </div>
  );
}
