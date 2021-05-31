import React, { useEffect } from "react";
import { Switch, Route, useRouteMatch } from "react-router";
import { Link } from "react-router-dom";
import { ProjectParams } from "model/route-params.model";
import { Button, Tag, Typography } from "antd";
import useNavMenu from "hook/use-nav-menu.hook";
import consts, { NAV } from "consts";
import { trim, remove } from "lodash";
import "./ProjectOverviewPage.scss";
import { useRecoilState } from "recoil";
import projectPageState from "state/project.state";
import { ProjectStatusEnum } from "api/generated/model";
import Scrollbar from "component/Scrollbar/Scrollbar";
import GlobalInfoCard from "./GlobalInfoCard";
import MemberInfoCard from "./MemberInfoCard";
import TeamInfoCard from "./TeamInfoCard";
import WorkUnitsInfoCard from "./WorkUnitsInfoCard";
import IssuesInfoCard from "./IssuesInfoCard";

const { PUBLIC_URL } = consts;

const ProjectInfoCard = () => {
  const {
    url,
    path,
    params: { projectId },
  } = useRouteMatch<ProjectParams>();

  const [{ project }, setState] = useRecoilState(projectPageState);
  return (
    <div className="project-info card">
      <div className="card-title">
        <span>项目信息</span>
        <Link to={`/projects/${projectId}/settings/project-info`}>
          <Button>查看详情</Button>
        </Link>
      </div>
      <Scrollbar autoHeight autoHeightMax={320} style={{ marginBottom: 12 }}>
        <div className="card-body">
          <div
            className="corbusiser"
            style={{
              backgroundImage: `url(${
                trim(project?.thumbnail) ||
                `${PUBLIC_URL}/assets/images/projectDefault.png`
              })`,
            }}
          />
          <div className="menta">
            <div
              style={{
                fontSize: 16,
                lineHeight: 1.5,
                wordBreak: "break-word",
                display: "flex",
              }}
            >
              <Typography.Text
                style={{
                  width: "100%",
                  // flex: "none",
                  overflow: "scroll",
                  marginBottom: -6,
                }}
                ellipsis={{ tooltip: true }}
              >
                {project?.name}
              </Typography.Text>
              {/* <span style={{ marginRight: 8 }}></span> */}
              {project?.status === ProjectStatusEnum.Ongoing && (
                <Tag color="blue">进行中</Tag>
              )}
              {project?.status === ProjectStatusEnum.Completed && (
                <Tag color="success">已完成</Tag>
              )}
              {project?.status === ProjectStatusEnum.Suspended && (
                <Tag>暂停中</Tag>
              )}
            </div>
            <div
              style={{
                fontSize: 12,
                marginTop: 12,
                wordBreak: "break-word",
                color: "rgba(0,0,0,0.65)",
              }}
            >
              {project?.description}
            </div>
          </div>
        </div>
      </Scrollbar>
    </div>
  );
};

interface OverviewPageProps {}

export default function OverviewPage(props: OverviewPageProps) {
  const {} = props;
  // const [{}, updateState] = useImmer<State>({});
  const {
    url,
    path,
    params: { projectId },
  } = useRouteMatch<ProjectParams>();
  useNavMenu(NAV.overviewBoard);

  return (
    <Scrollbar>
      <div className="board-page">
        <div className="title">项目看板</div>
        <div className="body">
          <div className="left">
            <ProjectInfoCard />
            <TeamInfoCard />
            <MemberInfoCard />
          </div>

          <div className="right">
            <GlobalInfoCard />
            <WorkUnitsInfoCard />
            <IssuesInfoCard />
          </div>
        </div>
      </div>
    </Scrollbar>
  );
}
