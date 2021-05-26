import { StructuralApi } from "api-struc";
import { Folder, FolderFolderTypeEnum } from "api/generated/model";
import { SuiteMetaBean } from "api-struc/generated/model";
import { AxiosStatic } from "axios";

export interface CategoryNode {
  count: number;
  weight: number;
  id: string;
  level: number;
  parentId: string | null;
  name: string;

  children: CategoryNode[];
}

export interface GJKResponse<T> {
  data: T;
}

export interface SuiteSearchCondition {
  categoryId: string | number;
  keyword: string;
}

export class StructureService {
  structureapi: StructuralApi;

  constructor(baseUrl: string, axios: AxiosStatic) {
    this.structureapi = new StructuralApi({}, baseUrl, axios);
  }

  async getProjectCategories(projectId: string) {
    const body = {
      categoryIds: [],
      keyword: "",
    };

    const response = await this.structureapi.getProjectSuiteCategoryUsingPOST(
      projectId,
      body,
    );
    const data = response.data as GJKResponse<CategoryNode[]>;
    const categoryList = data.data;
    return this.toTree(categoryList);
  }

  async getCommonCategories() {
    const response = await this.structureapi.getCommonSuite4V2UsingGET();
    const data = response.data as GJKResponse<CategoryNode[]>;
    const categoryList = data.data;
    return this.toTree(categoryList);
  }

  async getSuites(
    source: "common" | "project",
    condition: SuiteSearchCondition,
    projectId: string,
  ) {
    if (source === "project") {
      const body = {
        categoryCodes: [],
        categoryIds: [condition.categoryId.toString()],
        keyword: condition.keyword,
        projectId,
        page: 1,
        pageSize: 500,
      };

      const response = await this.structureapi.projectSuitesSearchUsingPOST(
        body,
      );
      return response.data.data?.list ?? [];
    }

    if (source === "common") {
      const body = {
        category: condition.categoryId.toString(),
        keyword: condition.keyword,
        page: 1,
        pageSize: 500,
      };

      const response = await this.structureapi.commonSuitesSearch4V2UsingPOST(
        body,
      );
      const data = response.data as GJKResponse<{ list: SuiteMetaBean[] }>;
      const suiteList = data.data.list;
      return suiteList;
    }
  }

  // async getCommonSuitesByCategoryId(catId: string) {
  //   const response = await this.structureapi.getSuiteDetailsUsingGET(
  //     catId,
  //     1,
  //     500
  //   );
  //   let data: any = response.data;
  //   let suiteList = data?.data?.list as SuiteMetaBean[];
  //   return suiteList;
  // }

  // async searchCommonSuitesByKeyword(keyword: string) {}

  async addSuiteToProject(suiteId: string, projectId: string) {
    const body = {
      projectId,
      suites: [suiteId],
    };
    const response = await this.structureapi.bindProjectSuitesUsingPOST(body);
    return response.data;
  }

  async checkSuiteExistInProject(suiteId: string, projectId: string) {
    const response = await this.structureapi.checkSuiteExistsByIdUsingPOST(
      suiteId,
      projectId,
    );
    const data = response.data as GJKResponse<any>;
    return data?.data;
  }

  toTree(nodes: CategoryNode[]): CategoryNode[] {
    const nodeMap = new Map<string, CategoryNode>();
    const roots: CategoryNode[] = [];

    nodes.sort((node1, node2) => node1.weight - node2.weight);

    nodes.forEach((node) => {
      nodeMap.set(node.id, node);
      if (node.parentId === null) {
        roots.push(node);
      }
    });

    nodes.forEach((node) => {
      if (node.parentId !== null && node.parentId !== undefined) {
        // parentId ===0
        const parentNode = nodeMap.get(node.parentId);
        if (parentNode) {
          parentNode.children = parentNode.children || [];
          parentNode.children.push(nodeMap.get(node.id)!);
        }
      }
    });

    return roots;
  }

  async checkHasPreset(projectId: string) {
    const response = await this.structureapi.checkProjectPresetSuitesUsingGET(
      projectId,
    );
    const exist = response.data.data;
    return exist ?? false;
  }

  async addPresetToProject(project: string) {
    const response = await this.structureapi.presetProjectSuitesUsingPOST(
      project,
    );
    return response.data as GJKResponse<any>;
  }

  async deleteSuiteProject(projectId: string, suiteId: string) {
    const response = await this.structureapi.deleteProjectSuiteUsingDELETE(
      projectId,
      suiteId,
    );
    return response.data;
  }
}
