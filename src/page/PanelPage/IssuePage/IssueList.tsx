import React, { useContext, useEffect, useCallback } from "react";
import { Tag, Typography, Drawer, message, Modal, Tooltip } from "antd";
import {
  IssueType,
  statusList,
  statusMap,
  transIssueTypeMap,
  typeList,
} from "component/issue/IssueList";
import { List, ListItem, Select, SelectOption } from "component/Antd";
import { useIssueList } from "hook/use-issue-service.hook";
import { useImmer } from "use-immer";
import PanelTabTitle from "component/PanelTabTitle";
import { timeago } from "function/date.func";
import panelService, { Camerainfo } from "service/panel.service";
import "./IssuePage.scss";
import { ArrowLeftOutlined, QuestionOutlined } from "@ant-design/icons";
import { authService, issueService, workUnitService } from "service";
import NewIssueModal from "component/issue/NewIssueModal";
import { cameraMapVersions } from "component/issue/IssueView";
import Iconfont from "component/Iconfont";
import { publishEvent } from "function/stats.func";
import { specialtyTypeName } from "AppPanel";
import IssueDetail from "./IssueDetail";
import PanelPageContext from "../PanelPageContext";

export interface CreatingIssueInfo {
  datasetid: string;
  datasetversion: number;
  elementid: string;
  elementname: string;
  markcoordinate?: { x: 0; y: 0; z: 0 };
}
const { Paragraph } = Typography;
interface IssueListProps {
  activeKey?: string;
  creatingIssueInfo?: CreatingIssueInfo;
}
interface IssueListState {
  filterStatus?: string;
  filterType?: string;
  selectedIssueId?: number;
  commitedWorkunitId?: string;
  loadingCommitWorkUnitIds?: boolean;
  showNewIssueModal: boolean;
  screenshoturl?: string;
  camerainfo?: Camerainfo;
}
const IssueList: React.FC<IssueListProps> = (props) => {
  const { activeKey, creatingIssueInfo } = props;
  const {
    refreshCount,
    workUnits,
    referedVersions,
    referWorkUnits,
    workUnit,
    version,
    specialtyType,
  } = useContext(PanelPageContext);
  const [
    {
      filterStatus,
      selectedIssueId,
      filterType,
      commitedWorkunitId,
      loadingCommitWorkUnitIds,
      showNewIssueModal,
      screenshoturl,
      camerainfo,
    },
    update,
  ] = useImmer<IssueListState>({
    filterStatus: undefined,
    filterType: undefined,
    selectedIssueId: undefined,
    loadingCommitWorkUnitIds: true,
    showNewIssueModal: false,
    screenshoturl: undefined,
    camerainfo: undefined,
  });
  useEffect(() => {
    if (workUnit?.id) {
      workUnitService
        .loadCommitWorkUnitIds([workUnit?.id])
        .then((commitWorkUnitIds) => {
          update((draft) => {
            draft.commitedWorkunitId =
              commitWorkUnitIds?.[0]?.committedDataSetId;
            draft.loadingCommitWorkUnitIds = false;
          });
        })
        .catch((err) => message.error(err));
    }
  }, [workUnit?.id]);
  const { issues, loading, refresh } = useIssueList({
    unitIds:
      !loadingCommitWorkUnitIds && workUnit
        ? [workUnit.id!, commitedWorkunitId ?? ""]
        : undefined,
    type: filterType,
  });
  useEffect(() => {
    if (activeKey === "3") refresh();
  }, [refreshCount, activeKey]);

  const getScreenShot = async () => {
    const res = await panelService.productproblemscreenshot();
    update((draft) => {
      draft.screenshoturl = res.screenshoturl;
      draft.camerainfo = res.camerainfo;
    });
  };

  useEffect(() => {
    if (creatingIssueInfo) {
      getScreenShot();
      update((draft) => {
        draft.showNewIssueModal = true;
      });
    }
  }, [creatingIssueInfo]);
  const commitNewIssue = useCallback(
    async ({
      title,
      description,
      workUnitId,
      croppedDataURL,
    }: {
      title: string;
      description?: string;
      workUnitId: string;
      croppedDataURL?: string | null;
    }) => {
      try {
        const userId = authService.getUserId()!;
        if (!camerainfo) {
          return;
        }
        const cameraMap = cameraMapVersions[cameraMapVersions.length - 1];
        const readValue = (field: string | string[]) =>
          typeof field === "string"
            ? camerainfo[field]
            : field.reduce((value, key) => value?.[key], camerainfo);
        const camera = cameraMap.reduce(
          (result: any, item) => {
            if (typeof item.field === "string") {
              return {
                ...result,
                [item.field]: readValue(item.valueField || item.field),
              };
            }
            item.field.reduce((value, key, index) => {
              if (!value[key] && index !== item.field.length - 1) {
                value[key] = {};
              } else if (item.field.length - 1 === index) {
                value[key] = readValue(item.valueField || item.field);
              }
              return value[key];
            }, result);
            return result;
          },
          { cameraVersion: cameraMapVersions.length - 1 },
        );
        const result = await issueService.createIssue({
          title,
          description,
          elementId: creatingIssueInfo?.elementid,
          userId,
          teamId: [...(workUnits || []), ...(referWorkUnits || [])].find(
            (item) => item.id === creatingIssueInfo?.datasetid,
          )?.teamId,
          file: croppedDataURL || undefined,
          camera: JSON.stringify({ ...camera }),
          elementName: `${
            creatingIssueInfo?.elementname
          } [${creatingIssueInfo?.elementid?.substr(-6, 6)}]`,
          issueDatasets: [
            {
              versionId: version?.id,
              isCurrent:
                version?.dataSetId === creatingIssueInfo?.datasetid ? 1 : 0,
            },
            ...referedVersions
              .filter((reveredVersion) => reveredVersion.id !== version?.id)
              .map((reveredVersion) => ({
                versionId: reveredVersion.id,
                isCurrent:
                  reveredVersion.dataSetId === creatingIssueInfo?.datasetid
                    ? 1
                    : 0,
              })),
          ],
          markCoordinate: JSON.stringify(
            creatingIssueInfo?.markcoordinate ?? "",
          ),
        });
        if (result) {
          update((draft) => {
            draft.showNewIssueModal = false;
            draft.screenshoturl = undefined;
          });
          refresh();
          publishEvent("createIssue", ["工具"], {
            from: specialtyTypeName[specialtyType],
          });
          panelService.productproblemcreatesuccess();
        }
        //   },
        // );
      } catch (error) {
        Modal.error({ content: JSON.stringify(error) });
      }
    },
    [creatingIssueInfo, referWorkUnits, referedVersions],
  );
  return (
    <>
      <List
        className="panel-body panel-issue-list"
        loading={loading}
        header={
          <>
            <div className="title">
              <PanelTabTitle
                title="问题列表"
                tip="右键菜单开始创建问题"
                tipLabel="如何新建问题？"
                icon={<QuestionOutlined />}
              />
            </div>
            <div className="title filter-header">
              <Select
                value={filterType}
                onChange={(value) =>
                  update((draft) => {
                    draft.filterType = value;
                  })
                }
                allowClear
                size="small"
                style={{ marginRight: 8 }}
                placeholder="按来源筛选"
              >
                {typeList.map((type) => (
                  <SelectOption key={type} value={type}>
                    {transIssueTypeMap(type)}
                  </SelectOption>
                ))}
              </Select>
              <Select
                style={{ flex: "auto" }}
                value={filterStatus}
                onChange={(value) =>
                  update((draft) => {
                    draft.filterStatus = value;
                  })
                }
                allowClear
                size="small"
                placeholder="全部"
              >
                {statusList.map((status) => (
                  <SelectOption key={status} value={status}>
                    {status}
                  </SelectOption>
                ))}
              </Select>
            </div>
          </>
        }
        dataSource={
          filterStatus
            ? issues.filter((issue) => issue.status === filterStatus)
            : issues
        }
        renderItem={(item, index) => (
          <ListItem
            className="issue-item"
            onClick={() => {
              update((draft) => {
                draft.selectedIssueId = item.id;
              });
            }}
          >
            <div className="row">
              <Paragraph ellipsis={{ rows: 2 }} className="issue-item-title">
                <Tooltip title="定位" placement="bottom">
                  <Iconfont
                    type="icon-wentiguanli-dingwei"
                    onClick={(event) => {
                      event.stopPropagation();
                      // setCamera(item);
                      panelService
                        .bimfaceprobleminfo(
                          item,
                          commitedWorkunitId
                            ? { [commitedWorkunitId]: workUnit?.id }
                            : {},
                        )
                        .catch((err) => message.error(err));
                      publishEvent("reviewIssue", ["工具"], {
                        from: specialtyTypeName[specialtyType],
                      });
                    }}
                  />
                </Tooltip>{" "}
                {item.type === IssueType.team ? "WT" : "PZ"}-{item.sequenceNo}#{" "}
                {item.title}
              </Paragraph>
              <Tag
                color={item.status && statusMap[item.status]?.color}
                className="issue-status-tag"
              >
                {item.status && statusMap[item.status]?.label}
              </Tag>
            </div>
            <div className="row">
              <span className="issue-item-info item-user-name">
                来源: {transIssueTypeMap(item.type)}
              </span>
              <span className="issue-item-info time-info">
                {timeago(item.updateTime || item.creationTime)}
              </span>
            </div>
          </ListItem>
        )}
      />
      <Drawer
        className="issue-detail-drawer issue-detail"
        placement="right"
        width="100%"
        closeIcon={
          <a>
            <ArrowLeftOutlined />
            返回
          </a>
        }
        onClose={() => {
          update((draft) => {
            draft.selectedIssueId = undefined;
          });
          refresh();
        }}
        visible={!!selectedIssueId}
        getContainer={false}
        style={{ position: "absolute" }}
      >
        {!!selectedIssueId && (
          <IssueDetail
            activeKey={activeKey}
            issueId={selectedIssueId}
            workunitIdRelationships={
              commitedWorkunitId ? { [commitedWorkunitId]: workUnit?.id } : {}
            }
          />
        )}
      </Drawer>
      <NewIssueModal
        onScreenshot={getScreenShot}
        isPanel
        workUnits={[
          {
            id: creatingIssueInfo?.datasetid,
            name: [...(workUnits || []), ...(referWorkUnits || [])].find(
              (item) => item.id === creatingIssueInfo?.datasetid,
            )?.name,
          },
        ]}
        croppedDataURL={screenshoturl}
        element={{
          unitId: creatingIssueInfo?.datasetid,
          elementName: `${
            creatingIssueInfo?.elementname
          } [${creatingIssueInfo?.elementid?.substr(-6, 6)}]`,
        }}
        visible={showNewIssueModal}
        onCommit={commitNewIssue}
        onClose={() => {
          // panelService.productproblemcreatecancel();
          update((draft) => {
            draft.showNewIssueModal = false;
            draft.screenshoturl = undefined;
          });
        }}
      />
    </>
  );
};
export default IssueList;
