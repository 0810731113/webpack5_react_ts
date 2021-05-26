import { Space, Tree } from "antd";
import WorkUnitModelComparisonView from "component/model/WorkUnitModelComparisonView";
import { isNullOrUndefined } from "function/common.func";
import React, { useEffect, useRef } from "react";
import { NumberParam, StringParam, useQueryParam } from "use-query-params";
import "./ModelViewerPage.scss";
import { useCompareElements } from "hook/use-element-service.hook";
import "./ModelComparatorPage.scss";
import { useImmer } from "use-immer";
import { Select, SelectOption } from "component/Antd";
import Loading from "component/Loading";
import { useVersionListByWorkUnits } from "hook/use-work-unit-service.hook";
import { getStatus, ConvertStatus } from "function/version.func";
import HeaderLogo from "./_shared/HeaderLogo";
import HeaderActions from "./_shared/HeaderActions";
import ProjectHeader from "./ProjectPage/ProjectPageComponents/ProjectHeader";

const compareColor = {
  added: "#00FF00",
  modified: "#FFFF00",
  deleted: "#FF0000",

  opacity: 0.8,
};
export interface ModelComparatorPageProps {}

export interface State {
  selectedBfIds?: React.ReactText[];
  checkedElements?: { bfId: React.ReactText; color: string }[];
  selectedElementIds?: React.ReactText[];
}

export default function ModelComparatorPage(props: ModelComparatorPageProps) {
  const {} = props;
  const [leftVersionId, updateLeftVersionId] = useQueryParam(
    "leftVersionId",
    NumberParam,
  );
  const [rightVersionId, updateRightVersionId] = useQueryParam(
    "rightVersionId",
    NumberParam,
  );
  const [workUnitId] = useQueryParam("workUnitId", StringParam);
  const [format] = useQueryParam("format", StringParam);
  const [title] = useQueryParam("title", StringParam);
  const treeWrap = useRef<HTMLElement>(null);
  const [
    { selectedBfIds, checkedElements, selectedElementIds },
    update,
  ] = useImmer<State>({
    selectedBfIds: undefined,
    checkedElements: undefined,
    selectedElementIds: undefined,
  });
  const { compareElements, loading, run } = useCompareElements(
    leftVersionId!,
    rightVersionId!,
  );
  const { versions, loading: loadingVersions } = useVersionListByWorkUnits(
    workUnitId || undefined,
    "committed",
  );
  const filteredVersions = versions.filter(
    (version) => getStatus(version) === ConvertStatus.success,
  );
  useEffect(() => {
    if (compareElements) {
      const addedElement = compareElements?.ADDED.map((element) => ({
        bfId: element.bfId!,
        color: compareColor.added,
      }));
      const modifiedElement = compareElements?.MODIFIED.map((element) => ({
        bfId: element.bfId!,
        color: compareColor.modified,
      }));
      const deletedElement = compareElements?.DELETED.map((element) => ({
        bfId: element.bfId!,
        color: compareColor.deleted,
      }));
      const elements = [...addedElement, ...modifiedElement, ...deletedElement];
      update((draft) => {
        draft.selectedBfIds = elements.map((element) => element.bfId);
        draft.checkedElements = elements;
      });
    }
  }, [compareElements]);
  const panelDatas = [
    {
      title: "已增加",
      color: "#39C729",
      data: compareElements?.ADDED,
    },
    {
      title: "已修改",
      color: "#EAA62E",
      data: compareElements?.MODIFIED,
    },
    {
      title: "已删除",
      color: "#D45757",
      data: compareElements?.DELETED,
    },
  ];
  const onCheck = (
    keys:
      | React.ReactText[]
      | { checked: React.ReactText[]; halfChecked: React.ReactText[] },
  ) => {
    const bfIds = Array.isArray(keys) ? keys : keys.checked;
    update((draft) => {
      draft.selectedBfIds = bfIds;
      draft.checkedElements = bfIds.map((bfId) => ({
        bfId,
        color: compareElements?.ADDED.some((element) => element.bfId === bfId)
          ? compareColor.added
          : compareElements?.MODIFIED.some((element) => element.bfId === bfId)
          ? compareColor.modified
          : compareColor.deleted,
      }));
    });
  };
  if (isNullOrUndefined(leftVersionId) || isNullOrUndefined(rightVersionId)) {
    return null;
  }

  return (
    <div className="model-comparator-page">
      <ProjectHeader needBack={false} title={title ?? "模型对比（抢先体验版）"} />

      <main ref={treeWrap}>
        {loading ? (
          <div className="list-loading">
            <Loading absolute size={32} />
          </div>
        ) : (
          <Tree
            defaultExpandAll
            checkable
            checkedKeys={selectedBfIds}
            onCheck={onCheck}
            onSelect={(selectedKeys) =>
              update((draft) => {
                draft.selectedElementIds = selectedKeys;
              })
            }
            className="list-components"
            height={(treeWrap.current?.clientHeight ?? 0) - 32}
          >
            {panelDatas.map((panelData, index) => (
              <Tree.TreeNode
                key={panelData.title}
                title={
                  <>
                    {panelData.title}
                    <span style={{ color: panelData.color }}>
                      （{panelData.data?.length}）
                    </span>
                  </>
                }
              >
                {panelData.data?.map((item) => (
                  <Tree.TreeNode
                    key={item.bfId}
                    title={
                      <>
                        {`${item.name}`} &nbsp;
                        <span style={{ color: panelData.color }}>●</span>
                      </>
                    }
                   />
                ))}
              </Tree.TreeNode>
              //   <List
              //     className="list-line"
              //     dataSource={panelData.data}
              //     renderItem={(item) => (
              //       <div
              //         className="item-line"
              //         key={item.id}
              //         onClick={() => item.bfId && panelData.onclick(item.bfId)}
              //       >
              //         <span style={{ color: panelData.color }}>●</span>&nbsp;
              //         {`${item.name}`}
              //       </div>
              //     )}
              //   ></List>
              // </Panel>
            ))}
          </Tree>
        )}
        <WorkUnitModelComparisonView
          format={format ?? ""}
          leftVersionId={leftVersionId}
          rightVersionId={rightVersionId}
          checkedElements={checkedElements}
          selectedElementIds={selectedElementIds}
          leftActions={
            <Select
              value={leftVersionId}
              onChange={(value) => updateLeftVersionId(value)}
            >
              {filteredVersions.map((version) => (
                <SelectOption
                  key={version.id!}
                  value={version.id!}
                  disabled={version.id === rightVersionId}
                >
                  {version.displayVersion}
                </SelectOption>
              ))}
            </Select>
          }
          rightActions={
            <Select
              value={rightVersionId}
              onChange={(value) => updateRightVersionId(value)}
            >
              {filteredVersions.map((version) => (
                <SelectOption
                  key={version.id!}
                  value={version.id!}
                  disabled={version.id === leftVersionId}
                >
                  {version.displayVersion}
                </SelectOption>
              ))}
            </Select>
          }
        />
      </main>
    </div>
  );
}
