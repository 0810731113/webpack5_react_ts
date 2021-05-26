import { AxiosStatic } from "axios";
import { generateDefaultSpaceData } from "../function/space.func";
import { formSchemaData } from "../consts";
import { ConfigApi } from "../api/generated/api/config-api";

export class SpaceSettingsService {
  configApi: ConfigApi;

  constructor(baseUrl: string, axios: AxiosStatic) {
    this.configApi = new ConfigApi({}, baseUrl, axios);
  }

  async get(projectId: string) {
    const response = await this.configApi.getConfigByVersionUsingGET(
      "SpaceConfig",
      "Project",
      projectId,
    );
    const schemaData = response.data?.configValue;
    const version = response.data?.version;
    const data = JSON.parse(schemaData ?? "{}")?.data;
    return {data, version};
    // return data ? JSON.parse(data) : null;
  }

  async update(projectId: string, nodes: SpaceTreeNode[]) {
    const response = await this.configApi.createConfigUsingPOST(
      "SpaceConfig",
      "Project",
      projectId,
      formSchemaData("SpaceConfig", nodes) as any,
    );
    const version = response.data?.version;
    return version;
  }

  async postDefault(projectId: string) {
    const response = await this.configApi.createConfigUsingPOST(
      "SpaceConfig",
      "Project",
      projectId,
      formSchemaData("SpaceConfig", generateDefaultSpaceData()) as any,
    );
    return response.data;
  }
}

export interface AttachValues {
  ArchitectureLevel: string;
  StructureLevel: string;
}
export interface SpaceTreeNode {
  id: string;
  spaceDescription: string;
  spaceType: string;
  spaceName: string;
  subSpaces?: SpaceTreeNode[];
  // spaceValue?: string;
  attachValues?: AttachValues;
}
