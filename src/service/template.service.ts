import { AxiosStatic } from "axios";
import { ProjectTemplateApi } from "api";
import { specialtyService, workUnitService, authService } from "service";
import { CreateMessagesConsumerTypeEnum } from "api/generated/model";
import { CreateMessagesProducerTypeEnum } from "../api/generated/model/create-messages";

export class TemplateService {
  templateapi: ProjectTemplateApi;

  constructor(baseUrl: string, axios: AxiosStatic) {
    this.templateapi = new ProjectTemplateApi({}, baseUrl, axios);
  }

  async getAllTemplates() {
    const resp = await this.templateapi.getProjectTemplatesUsingGET(
      authService.getUserId(),
    );
    return resp.data.data;
  }

  async saveAsTemplate(srcProjectId: string, templateName: string) {
    const resp = await this.templateapi.createProjectTemplateUsingPOST(
      authService.getUserId(),
      { srcProjectId, templateName },
    );
    return resp.data;
  }

  async deleteTemplate(id: string) {
    const resp = await this.templateapi.deleteProjectTemplatesUsingDELETE(id);
    return resp.data.data;
  }
}
