import { Card, Space, Row, Col, Badge } from "antd";
import Meta from "antd/lib/card/Meta";
import consts, { NAV } from "consts";
import { ProjectParams } from "model/route-params.model";
import React from "react";
import { useRouteMatch } from "react-router";
import { authService, projectService } from "service";
import "./AppsPage.scss";
import useNavMenu from "hook/use-nav-menu.hook";
import { useRecoilState } from "recoil";
import projectPageState from "state/project.state";
import { publishEvent } from "function/stats.func";

const {
  CLASH_URL,
  PUBLIC_URL,
  ENV,
  EXTENSION_CLEARHEIGHT_URL,
  EXTENSION_MODELCHECK_URL,
  EXTENTION_SS_URL,
} = consts;
interface AppsPageProps {}

interface State {}
export default function AppsPage(props: AppsPageProps) {
  const {
    url,
    path,
    params: { projectId },
  } = useRouteMatch<ProjectParams>();
  useNavMenu(NAV.appsSection);

  const [{ currentUser }, setState] = useRecoilState(projectPageState);

  const appslist =
    ENV === "production"
      ? [
          {
            title: "碰撞检测",
            key: "clash",
            imgSrc: `${PUBLIC_URL}/clash.png`,
            description:
              "检测自碰撞以及多团队多个模型间的碰撞，产生的冲突及时推送相关负责人解决，可显著减少设计变更。",
            siteUrl: `${CLASH_URL}/#/space?`,
          },
        ]
      : [
          {
            title: "碰撞检测",
            key: "clash",
            imgSrc: `${PUBLIC_URL}/clash.png`,
            description:
              "检测自碰撞以及多团队多个模型间的碰撞，产生的冲突及时推送相关负责人解决，可显著减少设计变更。",
            siteUrl: `${CLASH_URL}/#/space?`,
          },
          {
            title: "净高分析",
            key: "cha",
            imgSrc: `${PUBLIC_URL}/clearheight.png`,
            description:
              "检测模型中构件、管线的净高是否满足要求，根据检测结果快速定位并重新布置，减少设计变更。",
            siteUrl: `${EXTENSION_CLEARHEIGHT_URL}?`,
          },
          {
            title: "模型检查",
            key: "mc",
            imgSrc: `${PUBLIC_URL}/modelcheck.png`,
            description:
              "检查模型是否满足国标、地方规范，定位问题构件并指出不满足的条文，帮助用户快速发现并解决模型问题。",
            siteUrl: `${EXTENSION_MODELCHECK_URL}?`,
          },
          {
            title: "ShakeSpark渲染",
            key: "ss",
            imgSrc: `${PUBLIC_URL}/ss.png`,
            description:
              "在浏览器上提供模型的实时渲染服务，为用户提供漫游等沉浸式真实体验",
            siteUrl: `${EXTENTION_SS_URL}#`,
          },
        ];

  const clickEvent = (host: string) => {
    // 临时方案，看项目是否删除
    projectService.getProjectInfoV2(projectId).then(() => {
      // publishEvent(`进入应用`, {
      //   账号名称: currentUser?.name ?? "",
      // });

      const tabUrl = `${host}token=${authService.getToken()}&userId=${authService.getUserId()}&id=${projectId}`;
      window.open(tabUrl, "_blank");
      publishEvent("useApps", ["扩展应用"], {
        appName: "碰撞检测",
      });
    });
  };

  return (
    <div className="apps-page">
      <div className="title">已有应用（{appslist.length}）</div>

      <Row gutter={24}>
        {appslist.map((app) => (
          <Col
            xxl={{ span: 8 }}
            xl={{ span: 12 }}
            lg={{ span: 24 }}
            key={app.key}
          >
            <a
              target="_blank"
              rel="noreferrer"
              onClick={() => clickEvent(app.siteUrl)}
            >
              <Badge.Ribbon text="抢先体验版" style={{ padding: "0 8px" }}>
                <div className="apps-card">
                  <img src={app.imgSrc} />
                  <div className="card-info">
                    <div className="info-title">{app.title}</div>
                    <div className="info-menta">{app.description}</div>
                  </div>
                </div>
              </Badge.Ribbon>
            </a>
          </Col>
        ))}
      </Row>
    </div>
  );
}
