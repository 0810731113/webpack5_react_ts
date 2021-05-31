import React, { useEffect } from "react";
import { Switch, Route, useRouteMatch } from "react-router";
import { ProjectParams } from "model/route-params.model";
import { Link } from "react-router-dom";
import { Button, Avatar, Typography } from "antd";
import { useImmer } from "use-immer";
import { statService } from "service";
import { useRequest } from "@umijs/hooks";
import { TeamOverview } from "api-stat/generated/model";
import Loading from "component/Loading";
import consts from "consts";
import EmptyWrapper from "component/EmptyWrapper";
import Scrollbar from "component/Scrollbar/Scrollbar";

const { PUBLIC_URL, ENV } = consts;

interface TeamInfoCardProps {}

interface State {}

export default function TeamInfoCard(props: TeamInfoCardProps) {
  const {} = props;
  const [{}, updateState] = useImmer<State>({});
  const {
    url,
    path,
    params: { projectId },
  } = useRouteMatch<ProjectParams>();

  const loader = () => statService.getTeamInfo(projectId);
  const { loading, data, run } = useRequest<TeamOverview[]>(loader, {
    manual: true,
  });

  useEffect(() => {
    run();
  }, []);

  return (
    <div className="team-info card">
      <div className="card-title">
        <span>项目团队({data?.length ?? 0})</span>
        <Link to={`/projects/${projectId}/settings/collaboration/teams`}>
          <Button>查看详情</Button>
        </Link>
      </div>
      <Scrollbar autoHeight autoHeightMax={292} style={{ marginBottom: 12 }}>
        <div className="card-body">
          {loading ? (
            <Loading />
          ) : data?.length === 0 ? (
            <EmptyWrapper isEmpty description="暂无团队" />
          ) : (
            data?.map((team) => (
              <div className="team-line" key={team.teamId}>
                <Avatar
                  style={{
                    fontSize: 12,
                    backgroundSize: "cover",
                    backgroundImage: `url(${PUBLIC_URL}/assets/images/cover2.jpg)`,
                  }}
                  size={24}
                >
                  {team?.teamName?.substr(0, 1)}
                </Avatar>

                <Typography.Text
                  style={{
                    width: "100%",
                    // flex: "none",
                    overflow: "scroll",
                    marginBottom: -6,
                  }}
                  ellipsis={{
                    tooltip: true,
                  }}
                >
                  {team.teamName}
                </Typography.Text>

                <div className="action">
                  {team.isJoined ? (
                    <Link
                      to={`/projects/${projectId}/collaboration/teams/${team.teamId}/overview/workunits`}
                      style={{ color: "#13c2c2" }}
                    >
                      立即前往
                    </Link>
                  ) : (
                    <span style={{ color: "rgba(0,0,0,0.45" }}>
                      未加入该团队
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </Scrollbar>
    </div>
  );
}
