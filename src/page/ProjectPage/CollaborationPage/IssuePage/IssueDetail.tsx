import React, { useEffect, useRef, useState } from "react";
import { Row, Button, message, Image, Space, Table, Tooltip } from "antd";
import { Descriptions, DescriptionsItem } from "component/Antd";
import { useIssueDetail, useIssueImg } from "hook/use-issue-service.hook";
import { timeago } from "function/date.func";
import { useImmer } from "use-immer";
import { Link } from "react-router-dom";
import { NumberParam, withDefault, useQueryParams } from "use-query-params";
import SolveIssueModal, {
  SolveIssueModalTypeEnum,
} from "component/issue/SolveIssueModal";
import { issueService, authService } from "service";
import Loading from "component/Loading";
import { FullscreenOutlined } from "@ant-design/icons";
import IssueDetailStatus from "component/issue/IssueDetailStatus";
import {
  transIssueTypeMap,
  IssueType,
  StatusEnum,
} from "component/issue/IssueList";
import IssueInfo, { getLastVersion } from "component/issue/IssueInfo";
import { useVersionListByWorkUnits } from "hook/use-work-unit-service.hook";
import { VersionVO } from "api/generated/model";
import { IssueVOEx } from "hook/use-issue-service.hook";
import { useRecoilState, constSelector } from "recoil";
import projectPageState from "state/project.state";
import "./IssueDetail.scss";
import { TooltipWrapper } from "component/wrapper/TooltipWrapper";
import { publishEvent } from "function/stats.func";

interface IssueDetailProps {
  refresh: () => void;
}
const IssueDetail = (props: IssueDetailProps) => {
  const { refresh } = props;
  const [imgError, setImgError] = useState(false);
  const [{ activeIssueId }] = useQueryParams({
    activeIssueId: withDefault(NumberParam, undefined),
  });
  const [{ teams, currentUser, project }] = useRecoilState(projectPageState);
  const { issue, refresh: refreshDetail, loading } = useIssueDetail(
    activeIssueId,
  );
  const { issueImg: imgUrl } = useIssueImg(issue.file);
  useEffect(() => {
    setImgError(false);
  }, [imgUrl]);
  const onCommit = async () => {
    refreshDetail();
    refresh?.();
  };
  const { versions, loading: loadingVersions } = useVersionListByWorkUnits(
    issue.issueDatasets?.map((unit) => ({ id: unit.datasetId })) || undefined,
  );
  const currentUnit =
    (issue &&
      issue.issueDatasets &&
      issue.issueDatasets.find((unit) => unit.isCurrent)) ||
    {};
  if (loading || loadingVersions) {
    return <Loading absolute />;
  }
  if (!activeIssueId || !issue) {
    return null;
  }

  const isRelatedVersionDeleted = (_issue: IssueVOEx) => {
    if (_issue.issueDatasets && _issue.status === StatusEnum.Open) {
      const deletedVersion = _issue.issueDatasets.find(
        (unit) => unit.deleted === true,
      );
      return !!deletedVersion;
    }
    return false;
  };

  const extraData =
    (issue && issue.extraData && JSON.parse(issue.extraData)) || {};
  return (
    <div className="issue-detail">
      <div className="issue-detail-title">
        <span>
          {issue.type === IssueType.team ? "WT" : "PZ"}-{issue.sequenceNo}#{" "}
          {issue.title}
        </span>
        <IssueDetailStatus
          noBlock
          issue={issue}
          closeVersion={getLastVersion(versions, currentUnit)?.version}
          onCommit={onCommit}
          actions={
            issue.type === IssueType.team ? (
              <TooltipWrapper
                when={(tooltipProps) => tooltipProps.disabled ?? false}
                placement="bottomRight"
                disabled={isRelatedVersionDeleted(issue)}
                title="相关版本已被删除，暂不支持定位查看"
              >
                <Button
                  type="primary"
                  disabled={
                    issue?.status === StatusEnum.Open &&
                    issue?.issueDatasets?.some(
                      (unit) =>
                        unit.version === 0 &&
                        getLastVersion(versions, unit)?.version === 0,
                    )
                  }
                >
                  <Link
                    to={`/model-viewer?versionIdList=${issue?.issueDatasets?.map(
                      (unit) =>
                        issue?.status === StatusEnum.Open
                          ? unit.version
                            ? unit.versionId
                            : getLastVersion(versions, unit)?.id
                          : getLastVersion(versions, unit)?.id,
                    )}&format=${"gac"}&hideIssueList=1&isShowIssues=1&activeIssueId=${
                      issue.id
                    }&title=“${project?.name}”模型查看`}
                    target="_blank"
                    onClick={() => {
                      publishEvent(
                        `reviewIssueInModal`,
                        ["团队协同", "问题管理"],
                        {
                          eventLevel: "P2",
                        },
                      );
                    }}
                  >
                    模型中查看
                  </Link>
                </Button>
              </TooltipWrapper>
            ) : (
              extraData.url && (
                <Button type="primary">
                  <a href={extraData.url} target="_blank" rel="noreferrer">
                    碰撞检测中查看
                  </a>
                </Button>
              )
            )
          }
        />
      </div>
      <div
        className="issue-detail-content"
        // style={{
        //   width: "100%",
        //   height: 280,
        //   border: "solid 1px rgba(11, 26, 92, 0.14)",
        //   backgroundColor: "#d8d8d8",
        //   marginBottom: 24,
        // }}
      >
        <div>
          {/* {issue.status !== "解决中" && (
            <Row
              style={{
                background: "rgba(245,245,245,1)",
                borderRadius: 4,
                padding: 8,
                display: "flex",
              }}
            >
              <p style={{ margin: 4 }}>
                <p className="issue-label">
                  {issue.closeUserName} 已于 {timeago(issue.updateTime)}{" "}
                  将此问题
                  {issue.status === "已解决" ? "解决" : "关闭"}。
                </p>
                <p className="issue-label" style={{ marginTop: 12 }}>
                  备注: {issue.memo}
                </p>
              </p>
            </Row>
          )} */}
          <IssueInfo issue={issue} hideRemark />
          {/* <Descriptions>
            <DescriptionsItem label="问题来源">
              {transIssueTypeMap(issue.type)}
            </DescriptionsItem>
            <DescriptionsItem
              label={issue.type === IssueType.team ? "提出者" : "检测人"}
            >
              {issue.userName}-{issue.teamName}
            </DescriptionsItem>
            <DescriptionsItem
              label={issue.type === IssueType.team ? "提出时间" : "检测时间"}
            >
              {timeago(issue.creationTime)}
            </DescriptionsItem>
            {issue.type === IssueType.team && (
              <DescriptionsItem label="负责人">
                {issue.ownerName || "无"}
              </DescriptionsItem>
            )}
          </Descriptions>
          <Descriptions layout="vertical" style={{ marginTop: 0 }}>
            {issue.type !== IssueType.team && (
              <DescriptionsItem label="碰撞点处理方案">
                <Table
                  pagination={false}
                  columns={[
                    {
                      title: "碰撞点",
                      dataIndex: "categoryName",
                      key: "categoryName",
                    },
                    {
                      title: "工作单元",
                      dataIndex: "datasetName",
                      key: "datasetName",
                    },
                    {
                      title: "版本",
                      dataIndex: "version",
                      key: "version",
                      render: (value) => `${value}`,
                    },
                    {
                      title: "碰撞点处理方案",
                      dataIndex: "solution",
                      key: "solution",
                    },
                  ]}
                  dataSource={[extraData]}
                />
              </DescriptionsItem>
            )}
            {issue.type === IssueType.team && (
              <DescriptionsItem label="提出场景">
                <Table
                  pagination={false}
                  columns={[
                    {
                      title: "工作单元",
                      dataIndex: "datasetName",
                      key: "datasetName",
                    },
                    {
                      title: "版本",
                      dataIndex: "version",
                      key: "version",
                      render: (value) => `${value}`,
                    },
                  ]}
                  dataSource={issue.issueDatasets}
                />
              </DescriptionsItem>
            )}
            <DescriptionsItem
              label={issue.type === IssueType.team ? "构件详情" : "碰撞场景"}
            >
              <Table
                pagination={false}
                columns={[
                  {
                    title: "工作单元",
                    dataIndex: "datasetName",
                    key: "datasetName",
                  },
                  {
                    title: "版本",
                    dataIndex: "version",
                    key: "version",
                    render: (value) => `${value}`,
                  },
                  {
                    title: "构件详情",
                    dataIndex: "elementName",
                    key: "elementName",
                    render: (value) =>
                      `构件 ${issue.elementName || issue.elementId}`,
                  },
                ]}
                dataSource={[currentUnit]}
              />
            </DescriptionsItem>
          </Descriptions> */}
        </div>
        <Descriptions layout="vertical">
          {issue.type === IssueType.team && (
            <DescriptionsItem label="问题描述">
              {issue.description || "无"}
            </DescriptionsItem>
          )}
          {!imgError && (
            <DescriptionsItem label="问题快照">
              <div style={{ position: "relative" }}>
                <img
                  src={imgUrl}
                  style={{ width: "100%" }}
                  alt="snapshot"
                  onError={() => setImgError(true)}
                />
                <Tooltip title="查看大图" placement="bottom">
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      position: "absolute",
                      right: 16,
                      top: 16,
                      cursor: "pointer",
                    }}
                  >
                    <Image
                      src={imgUrl}
                      width={24}
                      height={24}
                      alt="snapshot"
                      onError={() => setImgError(true)}
                    />

                    <Button
                      style={{
                        width: 24,
                        height: 24,
                        padding: 0,
                        position: "absolute",
                        left: 0,
                        top: 0,
                        minWidth: 0,
                        pointerEvents: "none",
                      }}
                      icon={<FullscreenOutlined />}
                    />
                  </div>
                </Tooltip>
              </div>
            </DescriptionsItem>
          )}
        </Descriptions>
      </div>
    </div>
  );
};
export default IssueDetail;
