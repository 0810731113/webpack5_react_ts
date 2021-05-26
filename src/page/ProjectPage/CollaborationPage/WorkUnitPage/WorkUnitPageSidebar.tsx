import { ProjectTeamParams } from "model/route-params.model";
import React, { useEffect } from "react";
import { useRouteMatch, Link } from "react-router-dom";
import { Tree } from "antd";
import { DataNode } from "rc-tree/lib/interface";
import Loading from "component/Loading";
import { TreeNode } from "function/workUnit.func";
import { useQueryParams, StringParam, withDefault } from "use-query-params";
import { TeamPermissionResources, ShareRecordVO } from "api/generated/model";
import Scrollbars from "react-custom-scrollbars";
import { defaultScrollbarSettings } from "consts";
import { useImmer } from "use-immer";

export interface WorkUnitPageSidebarProps {
  nodes: TreeNode[] | null;
  permissions: TeamPermissionResources[];
  consumedData: ShareRecordVO[];
  loading?: boolean;
}

export interface WorkUnitPageSidebarState {
  treeData?: DataNode[];
}

export default function WorkUnitPageSidebar(props: WorkUnitPageSidebarProps) {
  const { nodes, permissions, consumedData, loading } = props;
  const [{ treeData }, updateState] = useImmer<WorkUnitPageSidebarState>({});
  const {
    url,
    path,
    params: { teamId },
  } = useRouteMatch<ProjectTeamParams>();
  const [{ folderTeamId, workUnitId }, setQueryParams] = useQueryParams({
    folderTeamId: withDefault(StringParam, undefined),
    workUnitId: withDefault(StringParam, undefined),
  });
  useEffect(() => {
    if (!loading && nodes && teamId) {
      updateState((draft) => {
        draft.treeData = nodes.map((node) => toTreeDataNode(node));
      });
    }
  }, [nodes, permissions, consumedData, loading, teamId]);
  useEffect(() => {
    setQueryParams({ folderTeamId: teamId, workUnitId: undefined });
  }, [teamId]);

  function toTreeDataNode(node: TreeNode, parentDisabled?: boolean): DataNode {
    let title: React.ReactNode = <span>{node.name}</span>;
    let disabled = false;
    switch (node.nodeType) {
      case "all":
        title = <Link to={`${url}`}>{node.name}</Link>;
        break;
      case "team":
        const permissioned = permissions.some(
          (perMissionTeam) => perMissionTeam.teamId === node.id,
        );
        const workUnitConsumed = consumedData.some(
          (data) => data.shareId === node.id,
        );
        title = (
          <Link to={`${url}?folderTeamId=${node.id}`}>
            {node.name} {permissioned && "（实时）"}{" "}
            {teamId === node.id && "（我的）"}
          </Link>
        );
        disabled = node.id !== teamId && !permissioned && !workUnitConsumed;
        break;
      case "workUnit":
        const consumed = consumedData.some((data) =>
          data.contents?.some((content) => content.dataSetId === node.id),
        );
        const parentPermissioned = permissions.some(
          (perMissionTeam) => perMissionTeam.teamId === node.teamId,
        );
        title = (
          <Link to={`${url}?workUnitId=${node.id}`}>
            {node.name} {consumed && "（已收资）"}
          </Link>
        );
        disabled =
          node.type !== "committedWorkunit" ||
          (node.teamId !== teamId && !parentPermissioned && !consumed);
        break;
    }
    return {
      disabled: parentDisabled || disabled,
      title: disabled ? node.name : title,
      key: node.id!,
      children: !node.children
        ? undefined
        : node.children
            .map((child) => toTreeDataNode(child, disabled))
            .sort((a, b) => (b.key === teamId ? 1 : -1)),
    };
  }

  return (
    <div className="work-unit-tree">
      <Scrollbars {...defaultScrollbarSettings}>
        {!loading && treeData ? (
          <Tree
            blockNode
            defaultExpandedKeys={["all", teamId]}
            selectedKeys={[folderTeamId || workUnitId || "all"]}
            treeData={treeData}
          />
        ) : (
          <Loading absolute size={48} />
        )}
      </Scrollbars>
    </div>
  );
}
