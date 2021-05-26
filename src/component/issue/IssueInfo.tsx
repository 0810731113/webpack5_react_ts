import React, { Fragment, ReactNode } from "react";
import { Table, Descriptions, Typography, Tag, Popover, Input } from "antd";
import { IssueVOEx } from "hook/use-issue-service.hook";
import consts from "consts";
import "./IssueView.scss";
import {
  transIssueTypeMap,
  IssueType,
  statusMap,
  StatusEnum,
} from "component/issue/IssueList";
import { defaultDateTimeFromString } from "function/date.func";
import { IssueDatasetVO as IssueDataset, VersionVO } from "api/generated/model";
import Modal from "antd/lib/modal/Modal";
import { useImmer } from "use-immer";
import Button from "component/Button";
import { isVersionViewable } from "function/version.func";
import IssueDetailStatus from "./IssueDetailStatus";

const { PUBLIC_URL } = consts;

export const getLastVersion = (versions: VersionVO[], unit: IssueDataset) =>
  versions.reduce(
    (maxVerson: VersionVO | undefined, version) =>
      version.dataSetId === unit.datasetId && isVersionViewable(version)
        ? maxVerson
          ? maxVerson.version! > version.version!
            ? maxVerson
            : version
          : version
        : maxVerson,
    undefined,
  );

const { Paragraph } = Typography;
const { Item: DescriptionsItem } = Descriptions;
interface IssueInfoState {
  showWorkflow: boolean;
}
interface IssueDetailProps {
  issue: IssueVOEx;
  actions?: ReactNode;
  isPanel?: boolean;
  hideRemark?: boolean;
}
const IssueInfo = (props: IssueDetailProps) => {
  const { issue, actions, isPanel, hideRemark } = props;
  const [{ showWorkflow }, update] = useImmer<IssueInfoState>({
    showWorkflow: false,
  });
  const currentUnit =
    (issue &&
      issue.issueDatasets &&
      issue.issueDatasets.find((unit) => unit.isCurrent)) ||
    {};
  const extraData =
    (issue && issue.extraData && JSON.parse(issue.extraData)) || {};
  return (
    <>
      <Descriptions column={1}>
        <DescriptionsItem label="问题状态">
          <Tag
            color={issue.status && statusMap[issue.status]?.color}
            className="issue-status-tag"
          >
            {issue.status && statusMap[issue.status]?.label}
          </Tag>{" "}
          {!isPanel && (
            <>
              (
              <Button
                type="link"
                onClick={() => {
                  update((draft) => {
                    draft.showWorkflow = true;
                  });
                }}
              >
                查看工作流
              </Button>
              )
            </>
          )}
        </DescriptionsItem>
        {actions && <div className="action-buttons">{actions}</div>}
        <DescriptionsItem label="问题来源">
          {transIssueTypeMap(issue.type)}
        </DescriptionsItem>
        {!isPanel && (
          <>
            <DescriptionsItem label="工作单元">
              {issue.issueDatasets?.map((dataset) => (
                <Fragment key={dataset.datasetId}>
                  {dataset.datasetName} <br />
                </Fragment>
              ))}
            </DescriptionsItem>
            <DescriptionsItem label="负责人">
              {issue.ownerName ? `${issue.teamName}-${issue.ownerName}` : "无"}
            </DescriptionsItem>
          </>
        )}
        {!hideRemark && issue.type === IssueType.team && (
          <DescriptionsItem label="问题描述">
            {issue.description || "无"}
          </DescriptionsItem>
        )}
      </Descriptions>
      <Descriptions column={1} layout="vertical" style={{ marginTop: 0 }}>
        {issue.type !== IssueType.team && (
          <>
            <DescriptionsItem label="碰撞点处理方案">
              <Table
                style={{ width: "100%" }}
                pagination={false}
                columns={[
                  {
                    title: "碰撞点",
                    dataIndex: "elementName",
                    key: "elementName",
                    render: (value, record) => (
                      <Paragraph copyable={{ text: record.elementId }}>
                        {value} [{record.elementId?.substr(-6, 6)}]
                      </Paragraph>
                    ),
                  },
                  {
                    title: "所属楼层",
                    dataIndex: "floorA",
                    key: "floorA",
                    render: (value) => value?.spaceName || "-",
                  },
                  {
                    title: "处理方案",
                    dataIndex: "solutionA",
                    key: "solutionA",
                  },
                ]}
                dataSource={[
                  {
                    ...extraData,
                    elementName: issue.elementName,
                    elementId: issue.elementId,
                  },
                ]}
              />
            </DescriptionsItem>
            <DescriptionsItem label="被碰撞工作单元情况">
              <Table
                style={{ width: "100%" }}
                pagination={false}
                columns={[
                  {
                    title: "碰撞点",
                    dataIndex: "categoryName",
                    key: "categoryName",
                    render: (value, record) => (
                      <Paragraph copyable={{ text: record.elementId }}>
                        {value} [{record.elementId?.substr(-6, 6)}]
                      </Paragraph>
                    ),
                  },
                  {
                    title: "所属楼层",
                    dataIndex: "floorB",
                    key: "floorB",
                    render: (value) => value?.spaceName || "-",
                  },
                  {
                    title: "工作单元",
                    dataIndex: "dataSetName",
                    key: "dataSetName",
                    render: (value, record) =>
                      [
                        record.dataSetName,
                        `${record.displayVersion}`,
                        record.teamName,
                      ]
                        .filter(Boolean)
                        .join("_"),
                  },
                ]}
                dataSource={[{ ...extraData }]}
              />
            </DescriptionsItem>
          </>
        )}
        {issue.type === IssueType.team && (
          <DescriptionsItem label="构件详情">
            <Table
              style={{ width: "100%" }}
              pagination={false}
              columns={[
                {
                  title: "工作单元",
                  dataIndex: "datasetName",
                  key: "datasetName",
                },
                {
                  title: "版本",
                  dataIndex: "displayVersion",
                  key: "displayVersion",
                  render: (value, record) =>
                    record.deleted ? "已删除版本" : value,
                },
                {
                  title: "构件详情",
                  dataIndex: "elementName",
                  key: "elementName",
                  render: (value) => {
                    const i = issue.elementName
                      ? issue.elementName.indexOf("[")
                      : -1;
                    const j = issue.elementName
                      ? issue.elementName.indexOf("]")
                      : -1;
                    const label =
                      i !== -1 && j !== -1
                        ? `${issue.elementName?.substring(
                            0,
                            i + 1,
                          )}${issue.elementName
                            ?.substring(i + 1, j)
                            .substr(-6, 6)}${issue.elementName?.substring(j)}`
                        : issue.elementName;
                    return (
                      <Paragraph copyable={{ text: issue.elementId }}>
                        构件
                        <br />
                        {label || `[${issue.elementId?.substr(-6, 6)}]`}
                      </Paragraph>
                    );
                  },
                },
              ]}
              dataSource={[currentUnit]}
            />
          </DescriptionsItem>
        )}
        <DescriptionsItem label="提问场景">
          <Table
            style={{ width: "100%" }}
            pagination={false}
            columns={[
              {
                title: "工作单元",
                dataIndex: "workunit",
                key: "workunit",
                render() {
                  const content = (
                    <Table
                      style={{ width: 286 }}
                      pagination={false}
                      dataSource={issue.issueDatasets}
                      columns={[
                        {
                          title: "工作单元",
                          dataIndex: "datasetName",
                          key: "datasetName",
                        },
                        {
                          title: "版本",
                          dataIndex: "displayVersion",
                          key: "displayVersion",
                          render: (value, record) =>
                            record.deleted ? "已删除版本" : value,
                        },
                        {
                          title: "团队",
                          dataIndex: "teamName",
                          key: "teamName",
                        },
                      ]}
                    />
                  );
                  return (
                    <Popover
                      content={content}
                      placement="bottomLeft"
                      autoAdjustOverflow={false}
                      overlayClassName="work-unit-table-popover"
                    >
                      <Input
                        size="small"
                        readOnly
                        value={`${issue.issueDatasets?.length}个`}
                        style={{ width: 60, textAlign: "center" }}
                      />
                    </Popover>
                  );
                },
                // render: (value, record) => issue.issueDatasets?.length,
              },
              {
                title: issue.type !== IssueType.team ? "检测时间" : "提出时间",
                dataIndex: "creationTime",
                key: "creationTime",
                render: (value) => defaultDateTimeFromString(value),
              },
              {
                title: issue.type !== IssueType.team ? "检测人" : "提问人",
                dataIndex: "userName",
                key: "userName",
              },
            ]}
            dataSource={[{ ...currentUnit, ...issue }]}
          />
        </DescriptionsItem>
        {issue.status === StatusEnum.Solve && (
          <DescriptionsItem label="解决场景">
            <Table
              style={{ width: "100%" }}
              pagination={false}
              columns={[
                {
                  title: "版本",
                  dataIndex: "closeDisplayVersion",
                  key: "closeDisplayVersion",
                  render: (value, record) =>
                    record.closeVersionDeleted ? "已删除版本" : value,
                },
                {
                  title: "解决时间",
                  dataIndex: "updateTime",
                  key: "updateTime",
                  render: (value) => defaultDateTimeFromString(value),
                },
                {
                  title: "解决人",
                  dataIndex: "closeUserName",
                  key: "closeUserName",
                },
              ]}
              dataSource={[{ ...currentUnit, ...issue }]}
            />
          </DescriptionsItem>
        )}
      </Descriptions>
      {issue.status === StatusEnum.Close && (
        <Descriptions column={1} style={{ marginTop: 0 }}>
          <DescriptionsItem label="解决场景">无需解决</DescriptionsItem>
          <DescriptionsItem label="理由">{issue.memo}</DescriptionsItem>
        </Descriptions>
      )}
      <Modal
        onCancel={() => {
          update((draft) => {
            draft.showWorkflow = false;
          });
        }}
        width={1000}
        className="workflow-modal"
        visible={showWorkflow}
        footer={
          <Button
            type="primary"
            onClick={() => {
              update((draft) => {
                draft.showWorkflow = false;
              });
            }}
          >
            确定
          </Button>
        }
        title="工作流"
      >
        <img src={`${PUBLIC_URL}/assets/images/workflow.png`} alt="work-flow" />
      </Modal>
    </>
  );
};
export default IssueInfo;
