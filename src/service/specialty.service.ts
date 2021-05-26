import { AxiosStatic } from "axios";
import { SpecialtyApi } from "api";
import { Specialty } from "../api/generated/model/specialty";

export class SpecialtyService {
  specialtyapi: SpecialtyApi;

  constructor(baseUrl: string, axios: AxiosStatic) {
    this.specialtyapi = new SpecialtyApi({}, baseUrl, axios);
  }

  async querySepcialty(projectId: string) {
    // let body = {
    //   projectId: projectId,
    // };
    const resp = await this.specialtyapi.getSpecialtiesInProjectUsingGET(projectId);

    return resp.data.data;
  }
}
