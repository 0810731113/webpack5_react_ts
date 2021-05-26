import { FolderApi } from "api";
import {
  Folder,
  FolderFolderTypeEnum,
  FolderVO,
  FolderVOFolderTypeEnum,
  Team,
} from "api/generated/model";
import { AxiosStatic } from "axios";
import { folderService } from "service";

export class FolderService {
  folderApi: FolderApi;

  constructor(baseUrl: string, axios: AxiosStatic) {
    this.folderApi = new FolderApi({}, baseUrl, axios);
  }

  async createFolder(
    name: string,
    projectId: string,
    parentId: string,
    teamId: string,
  ) {
    const response = await this.folderApi.createFolderUsingPUT({
      name,
      parentId,
      projectId,
      teamId,
    });
    return response.data;
  }

  async renameFolder(folderId: string, name: string) {
    const response = await this.folderApi.updateProjectUsingPOST1(
      folderId,
      name,
    );
    return response.data;
  }

  async deleteFolder(folderId: string) {
    const response = await this.folderApi.deleteProjectUsingDELETE1(folderId);
    return response.data;
  }

  async loadFolder(folderId: string) {
    const response = await this.folderApi.getFolderByIdUsingGET(folderId);
    return response.data.data;
  }

  async listFoldersByProjectId(projectId: string) {
    const response = await this.folderApi.getFolderByProjectUsingGET(projectId);
    return response.data;
  }

  async listFoldersByTeamId(teamId: string) {
    const response = await this.folderApi.getFoldersByTeamIdUsingGET(teamId);
    return response.data.data ?? [];
  }

  async listChildFolders(folderId: string) {
    const response = await this.folderApi.getChildFoldersUsingGET(folderId);
    return response.data;
  }

  fileFolderToTreeNode({
    id,
    name,
    folderType,
    parentId,
  }: FolderVO): TreeNode | null {
    const isFilesRoot = folderType === FolderVOFolderTypeEnum.OtherFiles;
    if (isFilesRoot || !folderType) {
      return {
        id: id!,
        folderType: FolderFolderTypeEnum.OtherFiles,
        type: isFilesRoot ? "filesRoot" : "files",
        parentId: parentId!,
        name: name!,
      };
    }
    return null;
  }

  async loadFilesTree(teamId: string) {
    const folders = (await folderService.listFoldersByTeamId(teamId)).filter(
      (f) => f.folderType !== FolderVOFolderTypeEnum.TeamRelated,
    );
    const nodeMap = new Map<string, TreeNode>();
    const roots: TreeNode[] = [];

    // 全部转为 node 数据
    folders.forEach((folder) => {
      const node = this.fileFolderToTreeNode(folder);
      // 只处理 folderType = OtherFiles 或者 null 的节点
      if (node) {
        nodeMap.set(folder.id!, node);
        if (folder.folderType === FolderVOFolderTypeEnum.OtherFiles) {
          roots.push(node);
        }
      }
    });

    // 创建树状关系
    folders.forEach((folder) => {
      if (folder.parentId) {
        const parentNode = nodeMap.get(folder.parentId);
        if (parentNode) {
          parentNode.children = parentNode.children || [];
          parentNode.children.push(nodeMap.get(folder.id!)!);
        }
      }
    });

    return roots;
  }

  toTree(folders: Folder[], teams: Team[]): TreeNode[] {
    const nodeMap = new Map<string, TreeNode>();
    const roots: TreeNode[] = [];
    folders.forEach((folder) => {
      const node = this.toTreeNode(folder);
      if (
        [
          FolderFolderTypeEnum.ProjectShare,
          FolderFolderTypeEnum.TeamRelated,
          FolderFolderTypeEnum.ProjectFile,
        ].includes(folder.folderType!)
      ) {
        node.type = "readonly";
      }

      nodeMap.set(folder.id!, node);
      if (!folder.parentId) {
        roots.push(node);
      }
    });

    folders.forEach((folder) => {
      if (folder.parentId) {
        const parentNode = nodeMap.get(folder.parentId);
        if (parentNode) {
          parentNode.children = parentNode.children || [];
          parentNode.children.push(nodeMap.get(folder.id!)!);
        }
      }
    });

    folders.forEach((folder) => {
      if (folder.folderType === FolderFolderTypeEnum.TeamRelated) {
        const node = nodeMap.get(folder.id!)!;
        node.children = node.children || [];
        const consumeTeam = teams.find(
          (team) => team.linkedFolderId === folder.id,
        );
        if (!consumeTeam) return;

        node.children.push({
          id: `${consumeTeam.id},draft`,
          name: "草稿",
          type: "workUnit",
          folderType: FolderFolderTypeEnum.Process,
          parentId: folder.id!,
        });
        node.children.push({
          id: `${consumeTeam.id},committed`,
          name: "提交",
          type: "workUnit",
          folderType: FolderFolderTypeEnum.Published,
          parentId: folder.id!,
        });
        node.children.push({
          id: `${folder.id}-consumer`,
          name: "收资",
          type: "readonly",
          parentId: folder.id!,
          children: teams
            .filter((team) => team.linkedFolderId !== folder.id)
            .map((team) => ({
                id: `${consumeTeam!.id!},${team.id!}`,
                type: "package",
                name: team.name!,
                parentId: "",
              })),
        });
      }
    });

    return roots;
  }

  toTreeNode(folder: Folder, workUnit = true): TreeNode {
    return {
      id: folder.id!,
      folderType: folder.folderType,
      type:
        folder.folderType === FolderFolderTypeEnum.OtherFiles ||
        !folder.folderType
          ? "files"
          : workUnit
          ? "workUnit"
          : "package",
      parentId: folder.parentId!,
      name: folder.name!,
    };
  }

  async getFilesFolder(teamId: string) {
    const folders = await this.listFoldersByTeamId(teamId);
    const filesFolder = folders.find(
      (folder) => folder.folderType === FolderVOFolderTypeEnum.OtherFiles,
    );
    return filesFolder;
  }
}

export interface TreeNode {
  id: string;
  folderType?: FolderFolderTypeEnum;
  type:
    | "workUnit"
    | "package"
    | "files"
    | "filesRoot"
    | "creating"
    | "editing"
    | "readonly";
  parentId: string;
  name: string;
  children?: TreeNode[];
}
