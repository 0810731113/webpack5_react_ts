import { FolderFolderTypeEnum } from "api/generated/model";
import { TreeNode } from "service/folder.service";

export function sortFolderTreeNodes(nodes: TreeNode[]) {
  const process: TreeNode[] = [];
  const published: TreeNode[] = [];
  const otherFiles: TreeNode[] = [];
  const rest: TreeNode[] = [];

  nodes.forEach((node) => {
    switch (node.folderType) {
      case FolderFolderTypeEnum.Process:
        process.push(node);
        break;
      case FolderFolderTypeEnum.Published:
        published.push(node);
        break;
      case FolderFolderTypeEnum.OtherFiles:
        otherFiles.push(node);
        break;
      default:
        rest.push(node);
        break;
    }
  });
  return [...process, ...published, ...rest, ...otherFiles];
}
