import React, { useEffect, Fragment, useState, useContext } from "react";
import { Typography, Row, Divider, Button, message, Table } from "antd";
import { Descriptions, DescriptionsItem } from "component/Antd";
import { useIssueDetail, useIssueImg } from "hook/use-issue-service.hook";
import { timeago } from "function/date.func";
import { useImmer } from "use-immer";
import {
  NumberParam,
  withDefault,
  useQueryParams,
  BooleanParam,
} from "use-query-params";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import "./IssuePage.scss";
import Loading from "component/Loading";
import panelService from "service/panel.service";
import { transIssueTypeMap, IssueType } from "component/issue/IssueList";
import IssueInfo, { getLastVersion } from "component/issue/IssueInfo";
import IssueDetailStatus from "component/issue/IssueDetailStatus";
import { useVersionListByWorkUnits } from "hook/use-work-unit-service.hook";
import { publishEvent } from "function/stats.func";
import { specialtyTypeName } from "AppPanel";
import PanelPageContext from "../PanelPageContext";

const { Title, Text } = Typography;
interface IssueDetailMiniProps {
  activeKey?: string;
  refresh?: () => void;
  issueId: number;
  workunitIdRelationships: { [commitedWorkunitId: string]: string | undefined };
}
interface IssueDetailMiniState {
  acitveKey: string | string[];
}
const IssueDetail = (props: IssueDetailMiniProps) => {
  const { refresh, issueId, workunitIdRelationships, activeKey } = props;
  const { refreshCount, specialtyType } = useContext(PanelPageContext);
  const [imgError, setImgError] = useState(false);
  const { issue, loading, refresh: refreshIssue } = useIssueDetail(issueId);
  const { issueImg: imgUrl } = useIssueImg(issue.file);
  const { versions, loading: loadingVersions } = useVersionListByWorkUnits(
    issue.issueDatasets?.map((unit) => ({ id: unit.datasetId })) || undefined,
  );
  const currentUnit =
    (issue &&
      issue.issueDatasets &&
      issue.issueDatasets.find((unit) => unit.isCurrent)) ||
    {};
  useEffect(() => {
    setImgError(false);
  }, [issue?.file]);
  const setCamera = () => {
    panelService.bimfaceprobleminfo(issue, workunitIdRelationships);
    // .catch((err) => message.error(err));
    publishEvent("reviewIssue", ["工具"], {
      from: specialtyTypeName[specialtyType],
    });
  };
  useEffect(() => {
    if (activeKey === "3") refreshIssue();
  }, [refreshCount, activeKey]);
  if (loading) {
    return <Loading absolute />;
  }
  return (
    <>
      <Title className="issue-title">
        {issue.type === IssueType.team ? "WT" : "PZ"}-{issue.sequenceNo}#{" "}
        {issue.title}
      </Title>
      <Button
        ghost
        type="primary"
        className="camera-button"
        size="small"
        onClick={setCamera}
        block
      >
        在视图中显示
      </Button>
      {/* {issue.status !== "解决中" && (
        <Row className="status-remark">
          <p style={{ margin: 4 }}>
            <p className="issue-label">
              {issue.closeUserName} 已于 {timeago(issue?.updateTime)} 将此问题
              {issue.status === "已解决" ? "解决" : "关闭"}。
            </p>
            <p className="issue-label">备注: {issue.memo}</p>
          </p>
        </Row>
      )} */}
      <IssueInfo
        issue={issue}
        isPanel
        actions={
          <IssueDetailStatus
            closeVersion={getLastVersion(versions, currentUnit)?.version}
            isPanel
            size="small"
            issue={issue}
            specialtyType={specialtyType}
            onCommit={() => {
              refresh?.();
              refreshIssue();
            }}
          />
        }
      />
      <Descriptions column={1} layout="vertical" style={{ marginTop: 0 }}>
        <DescriptionsItem label="问题快照">
          {!imgError && (
            <img
              src={imgUrl}
              className="snapshot-img"
              alt="snapshot"
              onError={() => setImgError(true)}
            />
          )}
        </DescriptionsItem>
      </Descriptions>
    </>
  );
};
export default IssueDetail;
