import React, { useEffect, Fragment, MutableRefObject } from "react";
import {
  Collapse,
  Row,
  Divider,
  Button,
  Drawer,
  Table,
  Image,
  Tooltip,
} from "antd";
import { useIssueDetail, useIssueImg } from "hook/use-issue-service.hook";
import { timeago } from "function/date.func";
import { useImmer } from "use-immer";
import {
  NumberParam,
  withDefault,
  useQueryParams,
  StringParam,
  BooleanParam,
} from "use-query-params";
import { ArrowLeftOutlined, FullscreenOutlined } from "@ant-design/icons";
import { useRecoilState } from "recoil";
import bimfacePageState from "state/bimface.state";
import { DrawerProps } from "antd/lib/drawer";
import { useVersionListByWorkUnits } from "hook/use-work-unit-service.hook";
import SolveIssueModal, { SolveIssueModalTypeEnum } from "./SolveIssueModal";
import IssueDetailStatus from "./IssueDetailStatus";
import { IssueType, transIssueTypeMap } from "./IssueList";
import { cameraMapVersions } from "./IssueView";
import IssueInfo, { getLastVersion } from "./IssueInfo";

interface IssueDetailMiniProps extends DrawerProps {
  view3d: MutableRefObject<any | null>;
  refresh: () => void;
}
interface IssueDetailMiniState {
  imgError: boolean;
  acitveKey: string | string[];
  solveModalType: SolveIssueModalTypeEnum;
}
const IssueDetailMini = (props: IssueDetailMiniProps) => {
  const { view3d, refresh, ...rest } = props;
  const [{ elementTreeData }] = useRecoilState(bimfacePageState);
  const [{ activeIssueId, hideIssueList }] = useQueryParams({
    activeIssueId: withDefault(NumberParam, undefined),
    hideIssueList: withDefault(BooleanParam, false),
  });
  const [
    { acitveKey, solveModalType, imgError },
    update,
  ] = useImmer<IssueDetailMiniState>({
    imgError: false,
    acitveKey: ["1"],
    solveModalType: SolveIssueModalTypeEnum.False,
  });
  const { issue, refresh: refreshDetail } = useIssueDetail(activeIssueId);
  const { issueImg: imgUrl } = useIssueImg(issue.file);
  const { versions, loading: loadingVersions } = useVersionListByWorkUnits(
    issue.issueDatasets?.map((unit) => ({ id: unit.datasetId })) || undefined,
  );
  useEffect(() => {
    update((draft) => {
      draft.acitveKey = ["1"];
    });
  }, [activeIssueId]);
  useEffect(() => {
    if (hideIssueList) {
      // TODO
      setTimeout(setCamera, 1000);
    }
  }, [hideIssueList, issue && issue.camera, view3d && view3d.current]);
  const setCamera = () => {
    if (issue && issue.camera && view3d && view3d.current) {
      view3d.current.setCameraStatus(JSON.parse(issue.camera));

      let bfId = issue.elementId;
      elementTreeData &&
        elementTreeData.some(
          (el) =>
            el.items &&
            el.items.some(
              (unit) =>
                unit.items &&
                unit.items.some((child) => {
                  if (child.id == issue.elementId) {
                    bfId = child.bfId;
                  }
                  return child.id == issue.elementId;
                }),
            ),
        );

      view3d.current.setSelectedComponentsById([bfId]);
    }
  };
  const hideSolveModal = () =>
    update((draft) => {
      draft.solveModalType = SolveIssueModalTypeEnum.False;
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
      <Drawer
        {...rest}
        width={320}
        closeIcon={
          <a>
            <ArrowLeftOutlined />
            返回
          </a>
        }
        className="issue-detail issue-detail-mini-drawer"
        mask={false}
        getContainer={false}
        style={{ position: "absolute", fontSize: 12 }}
      >
        {issue && (
          <>
            <p className="issue-title">
              {issue.type === IssueType.team ? "WT" : "PZ"}-{issue.sequenceNo}#{" "}
              {issue.title}
            </p>
            {issue && issue.camera && view3d && view3d.current && (
              <Row style={{ margin: "12px 0" }}>
                <Button type="primary" block onClick={setCamera}>
                  视图中显示
                </Button>
              </Row>
            )}
            <IssueInfo
              issue={issue}
              actions={
                <IssueDetailStatus
                  closeVersion={getLastVersion(versions, currentUnit)?.version}
                  size="small"
                  issue={issue}
                  onCommit={() => {
                    hideSolveModal();
                    refresh && refresh();
                    refreshDetail();
                    update((draft) => {
                      draft.acitveKey = [];
                    });
                  }}
                />
              }
            />
            {/* {issue.status !== "解决中" && (
              <Row
                style={{
                  background: "rgba(245,245,245,1)",
                  borderRadius: 4,
                  padding: 8,
                  display: "flex",
                  justifyContent: "space-around",
                }}
              >
                <p style={{ margin: 4 }}>
                  <p>
                    {issue.closeUserName} 已于 {timeago(issue?.updateTime)}{" "}
                    将此问题{issue.status === "已解决" ? "解决" : "关闭"}。
                  </p>
                  <p style={{ marginTop: 12 }}>备注: {issue.memo}</p>
                </p>
              </Row>
            )}
            <span className="issue-label">问题描述:</span>
            <Row style={{ marginTop: 8 }}>
              <p className="issue-content">{issue.description}</p>
            </Row>
            <Divider style={{ margin: "16px 0" }} />
            <Row>
              <span className="issue-label">问题来源:</span>
              <p className="issue-content">{transIssueTypeMap(issue.type)}</p>
            </Row>
            <Row>
              <span className="issue-label">提出者:</span>
              <p className="issue-content">
                {issue.userName}-{issue.teamName}
              </p>
            </Row>
            <Row>
              <span className="issue-label">提出时间:</span>
              <p className="issue-content">{timeago(issue?.creationTime)}</p>
            </Row>
            <Row>
              <span className="issue-label">负责人:</span>
              <p className="issue-content">{issue.ownerName || "无"}</p>
            </Row> */}
            {/* <Row>
              <span className="issue-label">提出场景:</span>
              <p className="issue-content">
                {issue.issueDatasets &&
                  issue.issueDatasets.map((unit) => (
                    <p key={unit.datasetId}>
                      {unit.datasetName} 版本 {unit.version}
                    </p>
                  ))}
              </p>
            </Row>
            <Row>
              <span className="issue-label">构件详情:</span>
              <p className="issue-content">
                <p>
                  {currentUnit.datasetName} 版本 {currentUnit.version}
                </p>
                <p>构件 {issue.elementName}</p>
              </p>
            </Row> */}
            {/* {issue.type !== IssueType.team && (
              <>
                <Row>
                  <span className="issue-label">碰撞点处理方案:</span>
                </Row>
                <Row>
                  <Table
                    size="small"
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
                </Row>
              </>
            )}
            {issue.type === IssueType.team && (
              <>
                <Row>
                  <span className="issue-label">提出场景:</span>
                </Row>
                <Row>
                  <Table
                    size="small"
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
                </Row>
              </>
            )}
            <Row>
              <span className="issue-label">
                {issue.type === IssueType.team ? "构件详情" : "碰撞场景"}:
              </span>
            </Row>
            <Row>
              <Table
                size="small"
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
                dataSource={
                  issue.type === IssueType.team
                    ? [currentUnit]
                    : issue.issueDatasets
                }
              />
            </Row> */}
            <Row>
              <span className="issue-label">问题快照 :</span>
            </Row>
            <div
              style={{
                position: "relative",
                marginTop: 16,
                border: "1px solid rgba(0, 0, 0, 0.15)",
              }}
            >
              <img
                src={imgUrl}
                style={{ width: "100%" }}
                alt="snapshot"
                onError={() =>
                  update((draft) => {
                    draft.imgError = true;
                  })
                }
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
                    onError={() =>
                      update((draft) => {
                        draft.imgError = true;
                      })
                    }
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
          </>
        )}
      </Drawer>
    </>
  );
};
export default IssueDetailMini;
