import { ProjectApi, ConfigApi } from "api";
import { AxisGrid } from "three-engine/bim/model/objects/axisgrid";
import Axios, { AxiosStatic } from "axios";

import consts from "consts";
import { generateGridSchema } from "../consts";

const { API_BASE_URL } = consts;

export class GridSettingsService {
  configApi: ConfigApi;

  projectApi: ProjectApi;

  constructor(baseUrl: string, axios: AxiosStatic) {
    this.configApi = new ConfigApi({}, baseUrl, axios);
    this.projectApi = new ProjectApi({}, baseUrl, axios);
  }

  async get(projectId: string) {
    const response = await this.configApi.getConfigByVersionUsingGET(
      "GridConfig",
      "Project",
      projectId,
    );
    const schemaData = response.data?.configValue;
    const version = response.data?.version;
    const axisGrid = JSON.parse(schemaData ?? "{}");
    const data = axisGrid?.data;
    const schemaVersion = axisGrid?.schemaVersion;
    return { data, version, schemaVersion };
    // return data ? JSON.parse(data) : null;
  }

  async update(projectId: string, data: Object) {
    const response = await this.configApi.createConfigUsingPOST(
      "GridConfig",
      "Project",
      projectId,
      generateGridSchema("GridConfig", data) as any,
    );
    const version = response.data?.version;

    if (version === 1) {
      await this.postGridType(projectId, 1);
    }
    return version;
  }

  async postDefault(projectId: string) {
    // 插入空白轴网
    const p = new AxisGrid();
    if (p) {
      const json = p.toJson();
      await this.update(projectId, json);
    }
  }

  async getGridType(projectId: string) {
    const response = await this.projectApi.getProjectGridTypeUsingGET(
      projectId,
    );
    return response.data.data ?? null;
  }

  async postGridType(projectId: string, type: number) {
    const response = await this.projectApi.setProjectGridType2UsingPOST(
      projectId,
      type,
    );
    return response.data.data;
  }

  // getGridType(projectId: string) {
  //   return Axios.get(`${API_BASE_URL}/projects/${projectId}/grid/type`).then(
  //     (res) => {
  //       return res.data?.data;
  //     },
  //   );
  // }

  // postGridType(projectId: string, type: number) {
  //   return Axios.post(
  //     `${API_BASE_URL}/projects/${projectId}/grid/type/${type}`,
  //   ).then((res) => {
  //     return res.data.data;
  //   });
  // }
}

export enum GridType {
  GDCP = 1,
  GARCH = 2,
}
