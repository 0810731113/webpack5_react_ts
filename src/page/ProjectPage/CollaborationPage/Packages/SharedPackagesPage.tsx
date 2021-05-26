import React, { useEffect } from "react";
import { message, Row, Select } from "antd";
import Button from "component/Button";
import Table from "component/Table";
import {
  useQueryParams,
  StringParam,
  withDefault,
  QueryParamConfig,
} from "use-query-params";
import { useRouteMatch, useLocation } from "react-router";
import { Link } from "react-router-dom";
import { ProjectTeamParams } from "model/route-params.model";
import { useSharePackages, SharePackageEx } from "hook/use-share-service.hook";
import {
  ShareRecordVOStatusEnum,
  ShareRecord,
  ShareRecordStatusEnum,
} from "api/generated/model";
import moment from "moment";
import { defaultDateTimeFromString } from "function/date.func";
import useBreadCrumbs from "hook/use-breadcrumb.hook";
import { useRecoilState } from "recoil";
import projectPageState from "state/project.state";
import { CheckPermission } from "component/CheckPermission/CheckPermission";
import { ResourcePermissionResourceEnum } from "api-authorization/generated/model";
import { TooltipWrapper } from "component/wrapper/TooltipWrapper";
import { BreadcrumbHeader } from "../CollaborationHeader";

interface SharedPackagesPageProps {}
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
export default function SharedPackagesPage(props: SharedPackagesPageProps) {
  const {} = props;
  const {
    url,
    params: { teamId },
  } = useRouteMatch<ProjectTeamParams>();
  const [{ teams }] = useRecoilState(projectPageState);
  const [{ status, showPackageModal }, setQuery] = useQueryParams({
    status: withDefault(StatusParam, undefined),
    showPackageModal: withDefault(StringParam, undefined),
  });
  useEffect(() => {
    teamId && setQuery({ status: undefined });
  }, [teamId]);

  const [data, loading] = useSharePackages({ status, teamId });

  const columns = [
    {
      title: "名称",
      dataIndex: "name",
      key: "name",
      ellipsis: true,
      render: (text: string, record: SharePackageEx) => (
        <Link to={`${url}/${record.shareRecordIds}?from=sharedPackages`}>
          {text}
        </Link>
      ),
    },
    {
      title: "描述",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (text: string) => (
        <span
          className={
            text === ShareRecordVOStatusEnum.Shared
              ? "done-label"
              : "not-done-label"
          }
        >
          {text === ShareRecordVOStatusEnum.Shared ? "已提资" : "草稿"}
        </span>
      ),
    },
    {
      title: "提资日期",
      dataIndex: "shareTime",
      key: "shareTime",
      render: (text: string) =>
        (text && defaultDateTimeFromString(text)) || "-",
    },
    {
      title: "提资者",
      dataIndex: "shareUserName",
      key: "shareUserName",
    },
    {
      title: "已收资团队数",
      dataIndex: "shareRecords",
      key: "shareRecords",
      render: (shareRecords: ShareRecord[], record: SharePackageEx) =>
        record.status === ShareRecordVOStatusEnum.Temporary
          ? "-"
          : `${shareRecords.reduce(
              (count, r) =>
                r.status === ShareRecordStatusEnum.Consumed ? count + 1 : count,
              0,
            )}/${shareRecords.length}`,
    },
  ];

  return (
    <div className="content packages-page">
      {/* <BreadcrumbHeader breadCrumbs={breadCrumbs} /> */}
      <div className="split-toolbar">
        <div>
          提资状态:
          <Select
            size="small"
            className="query-item"
            value={status}
            allowClear
            placeholder="全部"
            onChange={(value) => setQuery({ status: value })}
          >
            {[
              { key: ShareRecordVOStatusEnum.Temporary, name: "草稿" },
              { key: ShareRecordVOStatusEnum.Shared, name: "已提资" },
            ].map((item) => (
              <Select.Option key={item.key} value={item.key}>
                {item.name}
              </Select.Option>
            ))}
          </Select>
        </div>

        <CheckPermission
          resouseType={ResourcePermissionResourceEnum.SharePackage}
        >
          <TooltipWrapper
            when={(props) => props.disabled ?? false}
            title="处于示例项目中无该功能权限"
          >
            <Button
              type="primary"
              onClick={() => {
                if (teams?.length > 1) {
                  setQuery({ showPackageModal: "sharedPackages" });
                } else {
                  message.info("此项目下只有一个团队，暂不支持创建资料包");
                }
              }}
            >
              创建资料包
            </Button>
          </TooltipWrapper>
        </CheckPermission>
      </div>
      <Table dataSource={data} columns={columns} loading={loading} />
    </div>
  );
}
