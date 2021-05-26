import { AxiosStatic } from "axios";
import { MessageApi } from "api";
import { specialtyService, workUnitService } from "service";
import { CreateMessagesConsumerTypeEnum, SpecialtyVOTypeEnum } from "api/generated/model";
import moment from "moment";
import { CreateMessagesProducerTypeEnum } from "../api/generated/model/create-messages";

export class MessageService {
  messageapi: MessageApi;

  constructor(baseUrl: string, axios: AxiosStatic) {
    this.messageapi = new MessageApi({}, baseUrl, axios);
  }

  async doPublish(projectId: string) {

    const specialties = await specialtyService.querySepcialty(projectId);
    if (specialties) {
      const arcSpecialty = specialties!.find((ele) => ele.type === SpecialtyVOTypeEnum.GAP);
      if (arcSpecialty && arcSpecialty.id) {
        const datasets = await workUnitService.getDatasetsBySpecialtyId(
          arcSpecialty.id,
        );

        if (datasets instanceof Array && datasets.length > 0) {
          const dsIds = datasets.filter((ds) => ds.id).map((ds) => ds.id!);
          const resp = await this.sendMessages(projectId, dsIds);
          return "success";
        }
      }
    }
    return "failure";
  }

  async sendMessages(projectId: string, dsIds: string[]) {
    const now = new Date();
    const body = {
      consumerIds: dsIds,
      consumerType: CreateMessagesConsumerTypeEnum.ArchitectDataset,
      content: `用户在${moment(now).format("YYYY年MM月DD日HH时mm分")}更新了建筑专业级设置`,
      producerType: CreateMessagesProducerTypeEnum.ProjectProfessionConfig,
      producerSourceId: projectId,
    };

    return this.messageapi.createUsingPUT2(body);
  }
}
