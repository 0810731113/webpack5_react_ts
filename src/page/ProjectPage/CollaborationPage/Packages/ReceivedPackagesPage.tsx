import React, { useEffect } from "react";
import { Col, Select } from "antd";
import { Table, Row } from "component/Antd";
import {
  useQueryParams,
  StringParam,
  withDefault,
  QueryParamConfig,
} from "use-query-params";
import { useRouteMatch } from "react-router";
import { Link } from "react-router-dom";
import { ProjectTeamParams } from "model/route-params.model";
import { useShareRecords } from "hook/use-share-service.hook";
import { useRecoilState } from "recoil";
import projectPageState, { teamByIdSelector } from "state/project.state";
import { ShareRecordVOStatusEnum, ShareRecordVO } from "api/generated/model";
import moment from "moment";
import { defaultDateTimeFromString } from "function/date.func";
import useBreadCrumbs from "hook/use-breadcrumb.hook";
import { BreadcrumbHeader } from "../CollaborationHeader";

interface ReceivedPackagesPage {}
const StatusParam: QueryParamConfig<
  ShareRecordVOStatusEnum.Temporary | ShareRecordVOStatusEnum.Shared | undefined
> = {
  encode: (
    value:
      | ShareRecordVOStatusEnum.Temporary
      | ShareRecordVOStatusEnum.Shared
      | undefined,
  ) => value,
  /** Convert the query param string value to its native type */
  decode: (value: string | (string | null)[] | null | undefined) => {
    switch (value) {
      case ShareRecordVOStatusEnum.Temporary:
        return ShareRecordVOStatusEnum.Temporary;
      case ShareRecordVOStatusEnum.Shared:
        return ShareRecordVOStatusEnum.Shared;
      default:
        return undefined;
    }
  },
};
export default function ReceivedPackagesPage(props: ReceivedPackagesPage) {
  const {} = props;
  const [{ teams }] = useRecoilState(projectPageState);
  const {
    url,
    params: { teamId },
  } = useRouteMatch<ProjectTeamParams>();
  const [{ status, shareId }, setQuery] = useQueryParams({
    status: withDefault(StatusParam, undefined),
    shareId: withDefault(StringParam, undefined),
  });
  useEffect(() => {
    teamId && setQuery({ status: undefined });
  }, [teamId]);

  // const { breadCrumbs } = useBreadCrumbs(
  //   "收资记录",
  //   "receivedPackages",
  //   `${pathname}${search}`,
  //   1,
  // );

  const { records, loading } = useShareRecords({
    status: status ? [status] : undefined,
    consumeId: teamId,
  });

  const columns = [
    {
      title: "名称",
      dataIndex: "name",
      key: "name",
      ellipsis: true,
      render: (text: string, record: ShareRecordVO) => (
        <Link to={`${url}/${record.id}?from=receivedPackages`}>{text}</Link>
      ),
    },
    {
      title: "描述",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "提资者",
      dataIndex: "shareUserName",
      key: "shareUserName",
    },
    {
      title: "提资团队",
      dataIndex: "shareId",
      key: "shareId",
      render: (text: string) =>
        ((teams && teams.find((team) => team.id === text)) || {}).name,
    },
    {
      title: "提资日期",
      dataIndex: "shareTime",
      key: "shareTime",
      render: (text: string) =>
        (text && defaultDateTimeFromString(text)) || "-",
    },
    {
      title: "接收者",
      dataIndex: "consumeUserName",
      key: "consumeUserName",
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (text: string) => (
        <span
          className={
            text === ShareRecordVOStatusEnum.Consumed
              ? "done-label"
              : "not-done-label"
          }
        >
          {text === ShareRecordVOStatusEnum.Consumed ? "已" : "未"}收资
        </span>
      ),
    },
  ];

  return (
    <div className="content packages-page">
      <Row className="content-bar" gutter={16}>
        <Col key="teamQuery">
          提资团队:
          <Select
            size="small"
            className="query-item"
            value={shareId}
            onChange={(value) => setQuery({ shareId: value })}
            placeholder="所有团队"
            allowClear
          >
            {teams
              .filter((team) => team.id !== teamId)
              .map((team) => (
                <Select.Option key={team.id} value={team.id ?? ""}>
                  {team.name}
                </Select.Option>
              ))}
          </Select>
        </Col>
        <Col key="statusQuery">
          接收状态:
          <Select
            size="small"
            className="query-item"
            value={status}
            allowClear
            placeholder="全部"
            onChange={(value) => setQuery({ status: value })}
          >
            {[
              { key: ShareRecordVOStatusEnum.Consumed, name: "已接收" },
              { key: ShareRecordVOStatusEnum.Shared, name: "未接收" },
            ].map((item) => (
              <Select.Option key={item.key} value={item.key}>
                {item.name}
              </Select.Option>
            ))}
          </Select>
        </Col>
      </Row>
      <Table
        dataSource={records.filter(
          (record) => !shareId || record.shareId === shareId,
        )}
        columns={columns}
        loading={loading}
      />
    </div>
  );
}
