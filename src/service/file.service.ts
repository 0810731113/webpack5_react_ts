import { last , lowerCase } from "lodash";

import { FileApi } from "api";
import Axios, { AxiosStatic } from "axios";
import moment from "moment";
import consts from "../consts";

const { ENV } = consts;
export class FileService {
  fileApi: FileApi;

  files: Set<string> = new Set();

  constructor(baseUrl: string, axios: AxiosStatic) {
    this.fileApi = new FileApi({}, baseUrl, axios);
  }

  async initFileUploading(fileName: string, env: string) {
    const response = await this.fileApi.newFileUsingPUT(fileName, env);
    return response.data;
  }

  async uploadToObs(
    url: string,
    file: File,
    onProgress?: (percent: number) => void,
  ) {
    return Axios.create()
      .request({
        url,
        method: "PUT",
        data: file,
        headers: {
          "Content-Type": "",
        },
        onUploadProgress(e: any) {
          console.log(e);
          onProgress && onProgress((e.loaded / e.total) as number);
        },
      })
      .then(console.log)
      .then(() => {
        this.files.delete(file.name);
      });
  }

  async getDownloadFileUrl(filePath: string) {
    const response = await this.fileApi.getSASForReadUsingPOST(filePath, {
      headers: { "Content-Type": "text/plain" },
    });
    return response.data;
  }

  async doUpload(file: File, onProgress?: (percent: number) => void) {
    if (this.files.has(file.name)) {
      return;
    }
    this.files.add(file.name);
    const type = lowerCase(last(file?.name?.split(".")));
    const { fileOSSPath, fileUrlWithSAS } = await this.initFileUploading(
      `${moment(new Date()).format("YYYY-M-D")}/GDC.${type}`,
      ENV ?? "default",
    );
    return this.uploadToObs(fileUrlWithSAS!, file, onProgress).then(() => ({ fileOSSPath }));
  }

  async simpleSaveFile(file: File) {
    // var forms = new FormData()
    // var configs = {
    //     headers:{'Content-Type':'multipart/form-data'}
    // };
    // forms.append('file',file);
    const response = await this.fileApi.uploadFileUsingPUT(file);
    return response.data;
    // return Axios.put(`${bimhomeConfig.CdgUrl}/file/upload`, forms, configs).then(res => {
    //     return res;
    // });
  }
}
