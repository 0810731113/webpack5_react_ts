import React, { useEffect, MutableRefObject, ReactNode } from "react";
import { Tag, Space, Tooltip } from "antd";
import { List, ListItem, Select, SelectOption } from "component/Antd";
import { useIssueList } from "hook/use-issue-service.hook";
import { timeago } from "function/date.func";
import {
  NumberParam,
  withDefault,
  useQueryParams,
  BooleanParam,
} from "use-query-params";
import { useImmer } from "use-immer";
import { ListProps } from "antd/lib/list";
import { IssueVO } from "api/generated/model";
import { useRecoilState } from "recoil";
import bimfacePageState from "state/bimface.state";
import Loading from "component/Loading";
import { relative } from "path";
import Iconfont from "component/Iconfont";

const pageSize = 10;
export enum StatusEnum {
  Open = "解决中",
  WaitingForSubmission = "待提交",
  WaitingForVerification = "待验证",
  Solve = "已解决",
  Close = "已关闭",
}
export const statusList = [
  StatusEnum.Open,
  StatusEnum.WaitingForSubmission,
  StatusEnum.WaitingForVerification,
  StatusEnum.Solve,
  StatusEnum.Close,
];
export const statusLabelMap = {
  [StatusEnum.Open]: "打开中",
  [StatusEnum.WaitingForSubmission]: StatusEnum.WaitingForSubmission,
  [StatusEnum.WaitingForVerification]: StatusEnum.WaitingForVerification,
  [StatusEnum.Solve]: "验证解决",
  [StatusEnum.Close]: "无需解决",
};
export const statusColorList = ["red", "red", "orange", "green", "gray"];
export const statusMap: {
  [key: string]: { label: string; color: string };
} = statusList.reduce(
  (result, status, index) => ({
    ...result,
    [status]: {
      label: statusLabelMap[status],
      color: statusColorList[index],
    },
  }),
  {},
);
declare const Glodon: any;
export enum IssueType {
  team = "团队问题",
  collision = "碰撞检测",
}
export const typeList = [IssueType.team, IssueType.collision];
export const IssueTypeMap: { [key: string]: string } = {
  [IssueType.team]: "团队问题",
  [IssueType.collision]: "碰撞检测",
};
export function transIssueTypeMap(type?: string) {
  return (type && IssueTypeMap[type]) ?? "团队问题";
}
export interface IssueListProps
  extends ListProps<IssueVO>,
    React.RefAttributes<HTMLElement> {
  teamId?: string;
  view3d?: MutableRefObject<any | null>;
  isShowMark?: boolean;
  refreshTag?: number;
  title?: ReactNode;
  setSolvingCount?: (count: number) => void;
}
interface IssueListState {
  filterStatus?: string;
  filterType?: string;
  cunstomItemContainer: any;
  showIssues: IssueVO[];
  current: number;
}
const IssueList: React.FC<IssueListProps> = (props) => {
  const {
    teamId,
    view3d,
    isShowMark,
    refreshTag,
    title,
    setSolvingCount,
    ...rest
  } = props;
  const [{ versionList, elementTreeData }] = useRecoilState(bimfacePageState);
  const [
    { filterStatus, cunstomItemContainer, showIssues, filterType, current },
    update,
  ] = useImmer<IssueListState>({
    filterStatus: undefined,
    filterType: undefined,
    cunstomItemContainer: null,
    showIssues: [],
    current: 1,
  });
  const { issues, loading, refresh } = useIssueList({
    teamId,
    unitIds: versionList?.map((version) => version.dataSetId!),
    type: teamId ? filterType : IssueType.team,
  });
  const [{ activeIssueId }, setQuery] = useQueryParams({
    activeIssueId: withDefault(NumberParam, undefined),
    location: withDefault(BooleanParam, undefined),
  });
  const setSelectedElement = (issue?: IssueVO) => {
    if (view3d && view3d.current) {
      if (issue) {
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
      } else {
        view3d.current.clearSelectedComponents();
      }
      view3d.current.render();
    }
  };
  const setCamera = (issue: IssueVO) => {
    if (issue && issue.camera && view3d && view3d.current) {
      view3d.current.setCameraStatus(JSON.parse(issue.camera));

      setSelectedElement(issue);
    }
  };
  useEffect(() => {
    refresh();
  }, [refreshTag]);
  useEffect(() => {
    if (view3d?.current) {
      const drawableContainerConfig = new Glodon.Bimface.Plugins.Drawable.DrawableContainerConfig();
      // 设置容器配置匹配的对象
      drawableContainerConfig.viewer = view3d.current;
      // 创建标签容器
      update((draft) => {
        draft.cunstomItemContainer = new Glodon.Bimface.Plugins.Drawable.DrawableContainer(
          drawableContainerConfig,
        );
      });
    }
  }, [view3d?.current]);
  useEffect(() => {
    setSolvingCount &&
      setSolvingCount(
        (issues &&
          issues.reduce(
            (count, issue) => count + (issue.status === statusList[0] ? 1 : 0),
            0,
          )) ||
          0,
      );
    update((draft) => {
      draft.showIssues = filterStatus
        ? issues.filter((issue) => issue.status === filterStatus)
        : issues;
    });
    if (
      !issues ||
      issues.length === 0 ||
      issues.some((issue) => issue.id == activeIssueId)
    )
      return;
    setQuery({ activeIssueId: undefined });
  }, [issues, filterStatus]);
  const setMark = (item: IssueVO) => {
    if (!item.markCoordinate || !cunstomItemContainer) {
      return;
    }
    // 创建CustomItemConfig
    const config = new Glodon.Bimface.Plugins.Drawable.CustomItemConfig();
    const content = document.createElement("div");
    content.setAttribute(
      "class",
      `issue-point issue-point-${item.status && statusMap[item.status].color}`,
    );
    content.innerText = `${item.type === IssueType.team ? "WT" : "PZ"}-${
      item?.sequenceNo?.toString() || ""
    }`;

    content.onclick = () => {
      setQuery({ activeIssueId: item.id, location: true });
    };
    // 设置自定义标签配置
    config.content = content;
    config.viewer = view3d?.current;
    config.worldPosition = JSON.parse(item.markCoordinate);

    // 创建自定义标签对象
    const customItem = new Glodon.Bimface.Plugins.Drawable.CustomItem(config);
    // 将自定义标签添加至标签容器内
    cunstomItemContainer?.addItem(customItem);
  };

  useEffect(() => {
    if (cunstomItemContainer && showIssues) {
      cunstomItemContainer.clear();

      if (isShowMark) {
        (teamId
          ? showIssues
          : activeIssueId
          ? showIssues.filter((issue) => issue.id === activeIssueId)
          : showIssues.slice((current - 1) * pageSize, current * pageSize)
        ).forEach((issue) => setMark(issue));
        if (activeIssueId) {
          const issue = showIssues.find((issue) => issue.id === activeIssueId);
          setSelectedElement(issue);
        } else {
          setSelectedElement();
        }
      }
    }
  }, [cunstomItemContainer, showIssues, isShowMark, current, activeIssueId]);
  if (loading) {
    return (
      <div
        style={{ position: "relative", width: "100%", ...(rest.style || {}) }}
        className="issue-list"
      >
        <Loading absolute />
      </div>
    );
  }

  return (
    <List
      {...rest}
      className="issue-list"
      header={
        <div style={{ position: "relative" }}>
          <Space>{title}</Space>
          <Space className="issue-list-filters ">
            {teamId && (
              <Select
                value={filterType}
                onChange={(value) =>
                  update((draft) => {
                    draft.filterType = value;
                  })
                }
                allowClear
                size="small"
                style={{ width: 112 }}
                placeholder="按来源筛选"
              >
                {typeList.map((type) => (
                  <SelectOption key={type} value={type}>
                    {transIssueTypeMap(type)}
                  </SelectOption>
                ))}
              </Select>
            )}
            <Select
              value={filterStatus}
              onChange={(value) =>
                update((draft) => {
                  draft.filterStatus = value;
                })
              }
              allowClear
              size={teamId ? "small" : "middle"}
              style={{ width: teamId ? 112 : 296 }}
              placeholder="按标签筛选"
            >
              {statusList.map((status) => (
                <SelectOption key={status} value={status}>
                  {statusLabelMap[status]}
                </SelectOption>
              ))}
            </Select>
          </Space>
        </div>
      }
      pagination={
        teamId
          ? false
          : {
              size: "small",
              current,
              pageSize,
              total: showIssues.length,
              onChange: (page) => {
                update((draft) => {
                  draft.current = page;
                });
              },
            }
      }
      dataSource={
        teamId
          ? showIssues
          : showIssues.slice((current - 1) * pageSize, current * pageSize)
      }
      renderItem={(item: IssueVO, index) => (
        <ListItem
          className={`issue-item${
            teamId && activeIssueId === item.id ? " active" : ""
          }`}
          onClick={() => {
            setQuery({ activeIssueId: item.id });
            // setTimeout(() => {
            //     element.scrollIntoView()
            // });
          }}
        >
          <h3 className="issue-item-title">
            {!teamId && (
              <Tooltip title="定位" placement="bottom">
                <Iconfont
                  type="icon-wentiguanli-dingwei"
                  onClick={(event) => {
                    event.stopPropagation();
                    setCamera(item);
                  }}
                />
              </Tooltip>
            )}{" "}
            {item.type === IssueType.team ? "WT" : "PZ"}-{item.sequenceNo}#{" "}
            {item.title}
          </h3>
          <span className="issue-item-info item-user-name">
            {/* <UserOutlined style={{ marginRight: 4 }} />
            {item.userName} - {item.teamName} */}
            来源：{transIssueTypeMap(item.type)}
          </span>
          <Tag
            color={item.status && statusMap[item.status]?.color}
            className="issue-status-tag"
          >
            {item.status && statusMap[item.status]?.label}
          </Tag>
          <span className="issue-item-info time-info">
            {timeago(item.updateTime || item.creationTime)}
          </span>
        </ListItem>
      )}
    />
  );
};
export default IssueList;
