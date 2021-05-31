import React, { useEffect } from "react";
import { Switch, Route, useRouteMatch } from "react-router";
import { Link, useHistory } from "react-router-dom";
import { ProjectParams } from "model/route-params.model";
import { useImmer } from "use-immer";
import { statService } from "service";
import { useRequest } from "@umijs/hooks";
import { Bar } from "@ant-design/charts";
import Loading from "component/Loading";
import { PublishedDatasetsOverview } from "api-stat/generated/model";
import { useRecoilState } from "recoil";
import projectPageState from "state/project.state";
import EmptyWrapper from "component/EmptyWrapper";
import { ProjectRole } from "service/role.service";

interface WorkUnitsInfoCardProps {}

interface State {}

export default function WorkUnitsInfoCard(props: WorkUnitsInfoCardProps) {
  const {} = props;
  const [{}, updateState] = useImmer<State>({});
  const {
    url,
    path,
    params: { projectId },
  } = useRouteMatch<ProjectParams>();

  const [{ myTeams, roles }] = useRecoilState(projectPageState);
  const history = useHistory();
  const loader = () => statService.getPublishedDataSetInfo(projectId);
  const { loading, data, run } = useRequest<PublishedDatasetsOverview[]>(
    loader,
    {
      manual: true,
    },
  );

  useEffect(() => {
    run();
  }, []);

  const scrollbar = (data?.length ?? 0) > 8 ? { type: "vertical" } : false;
  const maxNumber = Math.max(
    ...(data?.map((x) => x.numberOfPublishedVersions ?? 0) ?? [0]),
  );

  const config = {
    data: data ?? [],
    yField: "teamName",
    xField: "numberOfPublishedVersions",
    // seriesField: "teamName",
    color: '#21C5C5',
    height: 290,
    scrollbar: scrollbar as any,
    maxBarWidth: 36,
    minBarWidth: 8,
    legend: false,
    xAxis: {
      tickInterval: Math.ceil(maxNumber / 5),
    },
    yAxis: {
      verticalLimitLength: 80,
      label: {
        maxLength: 10,
        autoEllipsis: true,
        style: {
          cursor: "pointer",
        },
      },
    },
    appendPadding: 16,
    meta: {
      numberOfPublishedVersions: {
        alias: "工作单元提交数",
        // maxLimit: 4,
      },
    },
    tooltip: {
      formatter: (datum: any) => {
        return {
          name: "工作单元提交数",
          value: datum.numberOfPublishedVersions,
        };
      },
    },
  };

  const checkEmpty = () => {
    if (data?.length === 0) {
      return (
        <EmptyWrapper
          isEmpty
          description={
            <>
              <div style={{ fontWeight: "bold" }}>暂无团队</div>
              <div style={{ color: "#aaa" }}>
                {!roles.includes(ProjectRole.ProjectAdmin) ? (
                  "请联系项目管理员创建团队"
                ) : (
                  <>
                    请前往
                    <Link
                      to={`/projects/${projectId}/settings/collaboration/teams`}
                    >
                      协同设置
                    </Link>
                    创建团队
                  </>
                )}
              </div>
            </>
          }
        />
      );
    }
    if (data?.every((team) => team?.numberOfPublishedVersions === 0)) {
      return (
        <EmptyWrapper
          isEmpty
          description={
            <>
              <div style={{ fontWeight: "bold" }}>暂无提交记录</div>
              <div style={{ color: "#aaa" }}>
                请使用广联达建筑设计、广联达结构设计、广联达机电设计提交工作单元
              </div>
            </>
          }
        />
      );
    }

    return null;
  };

  return (
    <div className="issue-info card">
      <div className="card-title">
        <span>工作单元提交统计</span>
      </div>
      <div className="card-body">
        {loading ? (
          <Loading />
        ) : (
          checkEmpty() ?? (
            <Bar
              {...(config as any)}
              onReady={(plot) => {
                (plot as any).on("axis-label:click", (evt: any) => {
                  const { x, y } = evt;
                  const arr = (plot as any).chart.getTooltipItems({ x, y });
                  if (arr.length > 0) {
                    const _data = arr[0]?.data;
                    if (_data.teamId) {
                      history.push(
                        `/projects/${projectId}/collaboration/teams/${_data.teamId}/overview/workunits`,
                      );
                    }
                  }
                });
              }}
            />
          )
        )}
      </div>
    </div>
  );
}
