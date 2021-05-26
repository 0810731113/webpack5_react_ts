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

interface VersionListProps {
  versions: VersionVO[];
  operationRender: (version: VersionVO) => React.ReactNode;
}

interface State {}

export default function VersionList(props: VersionListProps) {
  const { versions, operationRender } = props;
  const [{}, updateState] = useImmer<State>({});
  const {
    url,
    path,
    params: { projectId },
  } = useRouteMatch<ProjectParams>();

  useEffect(() => {}, []);

  const columns: ColumnType<VersionVO>[] = [
    {
      title: "版本",
      dataIndex: "versions",
      key: "versions",
      className: "versions",
      width: "13%",
      render(value, item) {
        return `V${item.version}`;
      },
    },

    {
      title: "日期",
      dataIndex: "datetime",
      width: "15%",
      render(value, item) {
        return defaultDateTimeFromString(item.creationTime);
      },
    },
    // {
    //   title: "大小",
    //   dataIndex: "datetime",
    //   width: "15%",
    //   render(value, item) {
    //     return "等瑞阳";
    //   },
    // },
    {
      title: "操作",
      dataIndex: "id",
      key: "id",
      // align: "right",
      width: "20%",
      render(value, record) {
        if (record && record.verifyStatus === "illegal") {
          return (
            <Tooltip
              trigger="hover"
              mouseEnterDelay={0.5}
              placement="bottom"
              title="非常抱歉，该版本数据似乎出现了问题，目前无法继续使用，请选择历史版本恢复"
            >
              <InfoCircleFilled
                style={{ color: "#faad14", fontSize: 14 }}
              />
            </Tooltip>
          );
        }

        return operationRender(record);
      },
    },
  ];

  const sortedVersions = orderBy(versions, "version").reverse();
  return (
    <Table
      pagination={{ pageSize: 200, hideOnSinglePage: true }}
      columns={columns}
      dataSource={sortedVersions}
    />
  );
}
