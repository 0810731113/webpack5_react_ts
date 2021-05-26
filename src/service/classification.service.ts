import { ClassificationControllerApi } from "api-bimcode";
import { Folder, FolderFolderTypeEnum, Team } from "api/generated/model";
import { AxiosStatic } from "axios";

export class ClassificationService {
  classificationControllerApi: ClassificationControllerApi;

  constructor(baseUrl: string, axios: AxiosStatic) {
    this.classificationControllerApi = new ClassificationControllerApi(
      {},
      baseUrl,
      axios,
    );
  }

  async getClassificationTree(codetype: string = "all") {
    const response = await this.classificationControllerApi.getClassificationTreeByClassificationTypeUsingGET(
      codetype,
    );
    return response.data;
  }
}
