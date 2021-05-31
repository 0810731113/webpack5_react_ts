import React, { useEffect } from "react";
import { Switch, Route, useRouteMatch } from "react-router";
import { ProjectParams } from "model/route-params.model";
import { useImmer } from "use-immer";
import { statService } from "service";
import { useRequest } from "@umijs/hooks";
import { ProjectBasicInfoOverview } from "api-stat/generated/model";
import Loading from "component/Loading";

interface GlobalInfoCardProps {}

interface State {}

export default function GlobalInfoCard(props: GlobalInfoCardProps) {
  const {} = props;
  const [{}, updateState] = useImmer<State>({});
  const {
    url,
    path,
    params: { projectId },
  } = useRouteMatch<ProjectParams>();

  const loader = () => statService.getGlobalInfo(projectId);
  const { loading, data, run } = useRequest<ProjectBasicInfoOverview>(loader, {
    manual: true,
  });

  useEffect(() => {
    run();
  }, []);

  const Dimension = [
    { key: "numberOfTeams", name: "项目团队" },
    { key: "numberOfDatasets", name: "项目工作单元总数" },
    { key: "numberOfMembers", name: "项目成员" },
    { key: "numberOfShareRecords", name: "团队提资记录" },
    { key: "numberOfShareConsumeRecords", name: "团队收资记录" },
    { key: "numberOfIssues", name: "项目问题数量" },
  ];

  return (
    <div className="global-info card">
      <div className="card-title">
        <span>全局信息统计</span>
      </div>
      <div className="card-body">
        {loading ? (
          <Loading />
        ) : (
          Dimension.map((dms) => (
            <div className="block" key={dms.key}>
              <div className="name">{dms.name}</div>
              <div className="number">{(data as any)?.[dms.key]??0}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
