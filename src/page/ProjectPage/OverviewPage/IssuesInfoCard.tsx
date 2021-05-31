import React, { useEffect, useRef } from "react";
import { Switch, Route, useRouteMatch, useHistory } from "react-router";
import { Link } from "react-router-dom";
import { ProjectParams } from "model/route-params.model";
import { useImmer } from "use-immer";
import { statService } from "service";
import { useRequest } from "@umijs/hooks";
import { Bar } from "@ant-design/charts";
import Loading from "component/Loading";
import { useRecoilState } from "recoil";
import { IssueStatusOverview, IssueOverview } from "api-stat/generated/model";
import projectPageState from "state/project.state";
import EmptyWrapper from "component/EmptyWrapper";
import { ProjectRole } from "service/role.service";
import { statusLabelMap, StatusEnum } from "component/issue/IssueList";

interface IssuesInfoCardProps {}

interface State {}

export default function IssuesInfoCard(props: IssuesInfoCardProps) {
  const {} = props;
  const [{}, updateState] = useImmer<State>({});
  const {
    url,
    path,
    params: { projectId },
  } = useRouteMatch<ProjectParams>();

  const [{ myTeams, roles }] = useRecoilState(projectPageState);
  const history = useHistory();
  const loader = () => statService.getIssueInfo(projectId);
  const { loading, data, run } = useRequest<IssueOverview[]>(loader, {
    manual: true,
  });

  useEffect(() => {
    run();
  }, []);

  const scrollbar = (data?.length ?? 0) > 8 ? { type: "vertical" } : false;

  const formData = (arr: IssueOverview[]) => {
    let rtData: any = [];

    arr.forEach((team) => {
      if (team.issueStatusOverviews && team.issueStatusOverviews.length > 0) {
        if (team.issueStatusOverviews.every((ov) => ov.numberOfIssues === 0)) {
          rtData.push({ ...team, numberOfIssues: 0, copyNumber: -1 });
        } else {
          rtData = rtData.concat(
            team.issueStatusOverviews.map((rest) => ({
              ...team,
              issueStatusOverviews: null,
              ...rest,
              status: statusLabelMap[rest.issueStatus!],
              copyNumber: rest.numberOfIssues,
            })),
          );
        }
      } else {
        rtData.push({ ...team, numberOfIssues: 0, copyNumber: -1 });
      }
    });
    const statusSeq: any = {
      打开中: 0,
      待提交: 1,
      待验证: 2,
      验证解决: 3,
      无需解决: 4,
    };
    rtData.sort((a: any, b: any) => statusSeq[b.status] - statusSeq[a.status]);
    return rtData;
  };

  const config: any = {
    data: formData(data ?? []),
    yField: "teamName",
    xField: "numberOfIssues",
    seriesField: "status",
    isPercent: true,
    isStack: true,
    label: {
      position: "middle",
      content: function content(item: any) {
        return `${(item.numberOfIssues * 100).toFixed(1)}%`;
      },
      layout: [
        { type: "interval-adjust-position" },
        { type: "interval-hide-overlap" },
        // { type: "adjust-color" },
      ],
    },

    xAxis: {
      label: {
        formatter: (text: string) => {
          const val = parseFloat(text);
          // if (!val) {
          //   return '0';
          // }
          return `${(val * 100).toFixed(0)}%`;
        },
      },
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

    color: (dataM: any) => {
      if (dataM.status === statusLabelMap[StatusEnum.Open]) {
        return "#cf1322";
      }
      if (dataM.status === statusLabelMap[StatusEnum.WaitingForVerification]) {
        return "#f8c53d";
      }
      if (dataM.status === statusLabelMap[StatusEnum.WaitingForSubmission]) {
        return "#fe534e";
      }
      if (dataM.status === statusLabelMap[StatusEnum.Solve]) {
        return "#76d341";
      }
      if (dataM.status === statusLabelMap[StatusEnum.Close]) {
        return "#e5e5e5";
      }
      return "black";
    },

    tooltip: {
      fields: ["numberOfIssues", "copyNumber", "status"],
      formatter: (datum: any) => {
        if (datum.copyNumber === -1) {
          return {
            name: "团队问题数",
            value: 0,
          };
        }
        return {
          name: datum.status,
          value: datum.copyNumber,
        };
      },
    },
    height: 290,
    appendPadding: 16,
    scrollbar,
    maxBarWidth: 36,
    minBarWidth: 8,
    legend: { position: "top-left" },
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
    if (formData(data ?? []).every((item: any) => item.numberOfIssues === 0)) {
      return (
        <EmptyWrapper
          isEmpty
          description={
            <>
              <div style={{ fontWeight: "bold" }}>暂无问题记录</div>
              <div style={{ color: "#aaa" }}>请使用网页或工具软件创建问题</div>
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
        <span>问题信息统计</span>
      </div>
      <div className="card-body">
        {loading ? (
          <Loading />
        ) : (
          checkEmpty() ?? (
            <Bar
              {...config}
              onReady={(plot) => {
                (plot as any).on("axis-label:click", (evt: any) => {
                  const { x, y } = evt;
                  const arr = (plot as any).chart.getTooltipItems({ x, y });
                  if (arr.length > 0) {
                    const _data = arr[0]?.data;
                    if (_data.teamId) {
                      history.replace(
                        `/projects/${projectId}/collaboration/teams/${_data.teamId}/issues`,
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
