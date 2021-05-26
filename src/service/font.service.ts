import { authService } from "service";
import { FontApi } from "api-struc";
import Axios, { AxiosStatic } from "axios";

export class FontService {
  fontapi: FontApi;

  constructor(baseUrl: string, axios: AxiosStatic) {
    this.fontapi = new FontApi(
      {},
      baseUrl,
      axios,
    );
  }

  async getFontList(projectId: string) {
    const response = await this.fontapi.listProjectFontUsingGET(
      projectId,
      authService.getUserId(),
    );
    return response.data.data;
  }

  async renameFontById(fontId: number, name: string, projectId: string) {
    const response = await this.fontapi.renameProjectFontUsingPUT(
      fontId,
      authService.getUserId(),
      {
        name,
        projectId,
      },
    );
    return response.data;
  }

  async getUploadFontUrl(name: string, projectId: string) {
    const response = await this.fontapi.applyUploadCommonFontUriUsingGET1(
      name,
      true,
      projectId,
      authService.getUserId(),
    );

    return response.data.data;
  }

  async addFont(
    fileType: string,
    name: string,
    projectId: string,
    fileOSSPath: string,
  ) {
    const response = await this.fontapi.submitProjectFontUsingPOST(
      authService.getUserId(),
      {
        fileType,
        name,
        override: false,
        projectId,
        uri: fileOSSPath,
      },
    );
    return response.data.data;
  }

  uploadFont(
    name: string,
    projectId: string,
    file: File,
    onProgress?: (percent: number) => void,
  ) {
    return this.getUploadFontUrl(name, projectId).then((url) => {
      const fileUrlWithSAS = url?.fileUrlWithSAS;
      const fileOSSPath = url?.fileOSSPath;
      if (fileUrlWithSAS && fileOSSPath) {
        return Axios.create()
          .request({
            url: fileUrlWithSAS,
            method: "PUT",
            data: file,
            headers: {
              "Content-Type": "",
            },
            onUploadProgress(e: any) {
              onProgress?.((e.loaded / e.total) as number);
            },
          })
          .then(() => fileOSSPath);
      }

      return Promise.reject(new Error("url error"));
    });
  }
}
