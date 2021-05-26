import { AxiosStatic } from "axios";
import { TableApi, NamespaceApi } from "api-store";

interface ConstructionDataVO {
  levelConfig: ConstructionDataType;
  version: string;
}

export interface ConstructionDataType {
  startTag: boolean;
  endTag: boolean;
}

export class ConstructionSettingsService {
  tableapi: TableApi;

  namespaceapi: NamespaceApi;

  namespace: string;

  tablename: string;

  owner: string;

  constructor(baseUrl: string, axios: AxiosStatic) {
    this.tableapi = new TableApi({}, baseUrl, axios);
    this.namespaceapi = new NamespaceApi({}, baseUrl, axios);
    this.namespace = "architecture";
    this.tablename = "arcconfig";
    this.owner = "8qHMWt6w1044A4TJT7vDVJZiYTtiHFni";
  }

  async getConfig(projectId: string) {
    const obj = (await this.getTable(projectId)) as any;

    if (obj) {
      const {version} = obj;
      const levelConfig = JSON.parse(obj.levelConfig);
      const data: ConstructionDataVO = {
        levelConfig,
        version,
      };
      return data;
    } 
      const levelConfig = { startTag: true, endTag: true };
      return { levelConfig, version: "0" };
    
  }

  async saveConfig(startTag: boolean, endTag: boolean, projectId: string) {
    const { version } = await this.getConfig(projectId);
    let newVersion = JSON.parse(version);
    await this.saveTable(
      { startTag, endTag },
      projectId,
      JSON.stringify(++newVersion),
    );

    return "success";
  }

  async getTable(projectId: string) {
    const body = {
      fields: [],
      filterConditionList: {
        condition: "MUST_PASS_ALL",
        fieldFilters: [
          {
            compareOp: "EQUAL",
            field: {
              name: "projectId",
              value: projectId,
            },
          },
        ],
      },
      owner: this.owner,
      partition: projectId,
    };

    const resp = await this.tableapi.loadDataUsingPOST(
      this.tablename,
      this.namespace,
      body,
    );
    const {data} = resp.data;
    const rows = data?.rows;

    let config = null;
    if (rows instanceof Array && rows.length > 0) {
      const records = rows.filter((ele) => ele.version);

      if (records instanceof Array && records.length > 0) {
        config = records.sort((a: any, b: any) => b.version - a.version)[0];
      }
    }

    return config;
  }

  async saveTable(
    obj: ConstructionDataType,
    projectId: string,
    version: string,
  ) {
    const body = {
      owner: this.owner,
      rows: [
        {
          partition: projectId,
          fields: [
            {
              name: "levelConfig",
              type: 0,
              value: JSON.stringify(obj),
            },
            {
              name: "projectId",
              type: 0,
              value: projectId,
            },
            {
              name: "version",
              type: 1,
              value: version,
            },
          ],
        },
      ],
    };

    const resp = await this.tableapi.addRowsUsingPOST(
      this.tablename,
      this.namespace,
      body,
    );
    return resp.data.data;
  }
}
