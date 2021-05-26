import { DeleteFilled, EditFilled, PlusOutlined } from "@ant-design/icons";
import { Space, Tree } from "antd";
import { DataNode } from "antd/lib/tree";
import {
  FolderFolderTypeEnum,
  FolderVO,
  FolderVOFolderTypeEnum,
} from "api/generated/model";
import Loading from "component/Loading";
import { uuidv4 } from "function/string.func";
import { cloneDeep, first, size } from "lodash";
import { ProjectTeamParams } from "model/route-params.model";
import React, { useEffect } from "react";
import { Route, Switch, useHistory, useRouteMatch } from "react-router";
import { Link } from "react-router-dom";
import { folderService } from "service";
import { TreeNode } from "service/folder.service";
import { useImmer } from "use-immer";
import FileListPage from "./FileListPage";

export interface FilesPageProps {}

export interface State {
  treeNodes: TreeNode[] | null;
  selectedFolderId: string | null;
}

export default function FilesPage(props: FilesPageProps) {
  const {} = props;
  const [{ treeNodes, selectedFolderId }, updateState] = useImmer<State>({
    treeNodes: null,
    selectedFolderId: null,
  });
  const {
    url,
    path,
    isExact,
    params: { projectId, teamId },
  } = useRouteMatch<ProjectTeamParams>();
  const { replace } = useHistory();

  function loadFilesTree(refreshUrl: boolean) {
    folderService.loadFilesTree(teamId).then((roots) => {
      updateState((draft) => {
        draft.treeNodes = roots;
      });

      if (size(roots) > 0 && refreshUrl) {
        replace(`${url}/folders/${first(roots)!.id}`);
      }
    });
  }

  function toTreeNode(node: TreeNode): DataNode {
    const title = <Link to={`${url}/folders/${node.id}`}>{node.name}</Link>;
    return {
      key: node.id,
      title,
      children: !node.children ? undefined : node.children.map(toTreeNode),
    };
  }

  useEffect(() => {
    loadFilesTree(true);
  }, [teamId]);

  if (!treeNodes) return <Loading />;
  return (
    <div className="work-units-page">
      <div className="sidebar">
        <Tree
          defaultExpandAll
          selectedKeys={[`${selectedFolderId}`]}
          showIcon={false}
          // showLine={{ showLeafIcon: true }}
          treeData={treeNodes.map(toTreeNode)}
        />
      </div>
      <main>
        <Switch>
          <Route
            path={`${path}/folders/:folderId`}
            render={({
              match: {
                params: { folderId },
              },
            }) => {
              updateState((draft) => {
                draft.selectedFolderId = folderId;
              });
              return <FileListPage parentUrl={url} loadTree={loadFilesTree} />;
            }}
          />
        </Switch>
      </main>
    </div>
  );
}


  // function toTreeNode(folder: FolderVO, workUnit = false): TreeNode {
  //   return {
  //     id: folder.id!,
  //     folderType: FolderFolderTypeEnum.OtherFiles,
  //     type:
  //       folder.folderType === FolderVOFolderTypeEnum.OtherFiles ||
  //       !folder.folderType
  //         ? "files"
  //         : workUnit
  //         ? "workUnit"
  //         : "package",
  //     parentId: folder.parentId!,
  //     name: folder.name!,
  //   };
  // }

  // function toTreeDataNode(node: TreeNode): DataNode {
  //   const title =
  //     node.type === "readonly" ? (
  //       <span>{node.name}</span>
  //     ) : node.type === "files" || node.type === "filesRoot" ? (
  //       <div className="file-folder">
  //         <Link to={`${url}/folders/${node.id}?mode=files`}>{node.name}</Link>
  //         <div className="actions">
  //           <Space>
  //             <span onClick={() => onCreateFolder(node)}>
  //               <PlusOutlined />
  //             </span>
  //             <span onClick={() => onEditFolder(node.id)}>
  //               <EditFilled />
  //             </span>
  //             {node.type !== "filesRoot" && (
  //               <span onClick={() => onDeleteFolder(node.id)}>
  //                 <DeleteFilled />
  //               </span>
  //             )}
  //           </Space>
  //         </div>
  //       </div>
  //     ) : node.type === "workUnit" ? (
  //       <Link to={`${url}/teams/${node.id}`}>{node.name}</Link>
  //     ) : node.type === "package" ? (
  //       <Link to={`${url}/packages/${node.id}`}>{node.name}</Link>
  //     ) : (
  //       <FolderNameEditor
  //         id={node.id}
  //         parentId={node.parentId}
  //         defaultName={node.name}
  //         type={node.type}
  //         onCancel={loadFilesTree}
  //         onComplete={loadFilesTree}
  //       />
  //     );
  //   return {
  //     title,
  //     key: node.id,
  //     selectable: node.type !== "readonly",
  //     children: !node.children
  //       ? undefined
  //       : sortFolderTreeNodes(node.children).map(toTreeDataNode),
  //   };
  // }

  // function findTreeNode(id: string, treeNode: TreeNode): TreeNode | null {
  //   if (treeNode.id === id) {
  //     return treeNode;
  //   }
  //   if (treeNode.children) {
  //     for (const node of treeNode.children) {
  //       const result = findTreeNode(id, node);
  //       if (result) return result;
  //     }
  //   }
  //   return null;
  // }

  // function onCreateFolder(node: TreeNode) {
  //   updateState((draft) => {
  //     console.log(node.id);
  //     draft.treeNodes?.forEach((n) => {
  //       console.log(cloneDeep(findTreeNode(node.id, n)));
  //       const targetNode = findTreeNode(node.id, n);
  //       if (targetNode) {
  //         targetNode.children = targetNode.children || [];
  //         targetNode.children.push({
  //           id: uuidv4(),
  //           name: "",
  //           type: "creating",
  //           parentId: node.id,
  //         });
  //       }
  //     });
  //   });
  // }

  // function onEditFolder(id: string) {
  //   updateState((draft) => {
  //     draft.treeNodes?.forEach((n) => {
  //       const targetNode = findTreeNode(id, n);
  //       targetNode && (targetNode.type = "editing");
  //     });
  //   });
  // }

  // function onDeleteFolder(folderId: string) {
  //   folderService.deleteFolder(folderId).then(loadFilesTree);
  // }