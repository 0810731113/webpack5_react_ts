import React, { useEffect } from "react";
import { Switch, Route, useRouteMatch } from "react-router";
import { ProjectParams } from "model/route-params.model";
import { Link } from "react-router-dom";
import { useImmer } from "use-immer";
import { Table, Tooltip } from "antd";
import { InfoCircleFilled } from "@ant-design/icons";
import { VersionVO, DataSetVO } from "api/generated/model";
import { ColumnType } from "antd/lib/table";
import { defaultDateTimeFromString } from "function/date.func";
import { orderBy } from "lodash";

import ProjectTeamName from "page/ProjectPage/_components/ProjectTeamName";
import ProjectUserName from "page/ProjectPage/_components/ProjectUserName";
import { VersionInfoObj } from "service/version.service";
import { versionService } from "service";
import { useRequest } from "@umijs/hooks";
import Loading from "component/Loading";

interface VersionInfoListProps {
  versionIds: number[];
  operationRender?: (version: VersionVO) => React.ReactNode;
}

interface State {
  versionsInfo: VersionInfoObj[];
}

export default function VersionInfoList(props: VersionInfoListProps) {
  const { versionIds } = props;
  const [{ versionsInfo }, updateState] = useImmer<State>({ versionsInfo: [] });
  const {
    url,
    path,
    params: { projectId },
  } = useRouteMatch<ProjectParams>();

  const loader = () => versionService.batchLoadVersionsInfoByIds(versionIds);
  const { loading, data, run } = useRequest(loader);

  const columns: ColumnType<VersionInfoObj>[] = [
    {
      title: "工作单元名称",
      dataIndex: "name",
      width: "20%",
    },
    {
      title: "版本",
      dataIndex: "versions",
      width: "10%",
      render(value, item) {
        return item.displayVersion;
      },
    },
    {
      title: "团队",
      dataIndex: "team",
      width: "10%",
      render(value, item) {
        return <ProjectTeamName id={item.teamId ?? ""} />;
      },
    },

    {
      title: "日期",
      dataIndex: "datetime",
      width: "20%",
      render(value, item) {
        return defaultDateTimeFromString(item.updateTime);
      },
    },
    {
      title: "负责人",
      dataIndex: "datetime",
      width: "10%",
      render(value, item) {
        return <ProjectUserName id={item.ownerId ?? ""} />;
      },
    },
  ];

  if (loading || !data) {
    return <Loading />;
  }

  const sortedVersions = orderBy(data, "teamId").reverse();
  return (
    <Table
      pagination={{ pageSize: 200, hideOnSinglePage: true }}
      columns={columns}
      dataSource={sortedVersions}
    />
  );
}
