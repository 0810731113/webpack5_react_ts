/* eslint-disable camelcase */
/* eslint-disable no-return-await */
/* eslint-disable no-empty-function */
/* eslint-disable no-useless-constructor */
import { IssueVO } from "api/generated/model";
import qwebService from "./qweb.service";

export interface Camerainfo {
  [kes: string]: any;
  name: string;
  position: { x: number; y: number; z: number };
  target: { x: number; y: number; z: number };
  up: { x: number; y: number; z: number };
  fov: number;
  zoom: number;
  version: number;
  coordinateSystem: string;
}

interface ScreenshotInfo {
  screenshoturl: string;
  camerainfo: Camerainfo;
}

interface ShowToolTipArguments {
  x: number;
  y: number;
  width: number;
  height: number;
  tooltip: string;
  placement?: string;
  delay?: number;
  closedelay?: number;
}

/**
 * https://km.glodon.com/pages/viewpage.action?pageId=82608203
 */
export class PanelService {
  constructor() {}

  // #region 面板相关
  openbrowser(navigateurl: string) {
    return qwebService.sendAndGetResult<{}>({
      actionname: "openbrowser",
      arguments: {
        navigateurl,
      },
    });
  }

  logout() {
    return qwebService.directSend({
      actionname: "logout",
    });
  }

  showtooltip({
    x,
    y,
    width,
    height,
    tooltip,
    placement = "right",
    delay,
    closedelay,
  }: ShowToolTipArguments) {
    return qwebService.directSend({
      actionname: "showtooltip",
      arguments: {
        rectangle: { x, y, width, height },
        tooltip,
        placement,
        delay,
        closedelay,
      },
    });
  }

  hidetooltip() {
    return qwebService.directSend({
      actionname: "hidetooltip",
    });
  }

  panelresize(width: number, minimized: boolean) {
    return qwebService.directSend({
      actionname: "panelresize",
      arguments: {
        width,
        height: "100%",
        minimized: minimized ? "1" : "0",
      },
    });
  }

  networkState(state: string) {
    console.log(new Date().toLocaleTimeString(), state);
    return qwebService.directSend({
      actionname: "networkstate",
      arguments: {
        state,
      },
    });
  }
  // #endregion

  // #region 登录/认证
  getUserInfo() {
    return qwebService.sendAndGetResult<UserInfo>({
      actionname: "login",
    });
  }
  // #endregion

  // #region 工作单元
  openWorkUnit(datasetid: string, version: number) {
    return qwebService.sendAndGetResult<{}>({
      actionname: "openworkunit",
      arguments: {
        datasetid,
        version,
      },
    });
  }

  saveWorkUnit(showprocess: number) {
    return qwebService.directSend({
      actionname: "saveworkunit",
      arguments: {
        showprocess,
      },
    });
  }

  commitWorkUnit(showprocess: number) {
    return qwebService.directSend({
      actionname: "commitworkunit",
      arguments: {
        showprocess,
      },
    });
  }

  // grid
  // openGrid(projectid: string) {
  //   return qwebService.sendAndGetResult<{}>({
  //     actionname: "opengrid",
  //     arguments: {
  //       projectid,
  //     },
  //   });
  // }

  // uploadGrid(showprocess: number) {
  //   return qwebService.sendAndGetResult<{}>({
  //     actionname: "uploadgrid",
  //     arguments: {
  //       showprocess,
  //     },
  //   });
  // }

  getActiveWorkUnit() {
    return qwebService.sendAndGetResult<{ workingunit: string }>({
      actionname: "getworkunit",
    });
  }
  // #endregion

  // #region 参照
  linkworkunit(
    datasetid: string,
    version: number,
    linkedtypename: string,
    datacodes: string[],
  ) {
    return qwebService.sendAndGetResult<{}>({
      actionname: "linkworkunit",
      arguments: {
        datasetid,
        version,
        linkedtypename,
        datacodes,
      },
    });
  }

  getModelViews(filepath: string) {
    return qwebService.sendAndGetResult<{
      datasetid: string;
      version: number;
    }>({
      actionname: "getmodelviews",
      arguments: {
        filepath,
      },
    });
  }

  updatelinkedworkunit(datasetid: string, version: number) {
    return qwebService.sendAndGetResult<{}>({
      actionname: "updatelinkedworkunit",
      arguments: {
        datasetid,
        version,
      },
    });
  }

  deletelinkedworkunit(datasetid: string) {
    return qwebService.sendAndGetResult<{}>({
      actionname: "deletelinkedworkunit",
      arguments: {
        datasetid,
      },
    });
  }

  showlinkedworkunit(datasetid: string) {
    return qwebService.sendAndGetResult<{}>({
      actionname: "showlinkedworkunit",
      arguments: {
        datasetid,
      },
    });
  }

  hidelinkedworkunit(datasetid: string) {
    return qwebService.sendAndGetResult<{}>({
      actionname: "hidelinkedworkunit",
      arguments: {
        datasetid,
      },
    });
  }

  getlinkedworkunits(datasetid: string) {
    return qwebService.sendAndGetResult<{}>({
      actionname: "getlinkedworkunits",
      arguments: {
        datasetid,
      },
    });
  }

  // #endregion

  // #region 获取问题快照
  async productproblemscreenshot() {
    return await qwebService.sendAndGetResult<ScreenshotInfo>({
      actionname: "productproblemscreenshot",
    });
  }

  // #region 创建问题成功
  async productproblemcreatesuccess() {
    return await qwebService.sendAndGetResult<any>({
      actionname: "productproblemcreatesuccess",
    });
  }

  // #region 创建问题取消
  async productproblemcreatecancel() {
    return await qwebService.sendAndGetResult<any>({
      actionname: "productproblemcreatecancel",
    });
  }

  // #region 问题列表
  bimfaceprobleminfo(
    issueInfo: IssueVO,
    workunitIdRelationships: {
      [commitedWorkunitId: string]: string | undefined;
    },
  ) {
    const camera =
      (issueInfo.camera && JSON.parse(issueInfo.camera)) ??
      (issueInfo.markCoordinate && {
        target: JSON.parse(issueInfo.markCoordinate),
      }) ??
      {};
    const extraData = issueInfo.extraData && JSON.parse(issueInfo.extraData);
    const postArguments = {
      issueid: issueInfo.id,
      hitpoint: [
        ...(issueInfo.issueDatasets
          ?.filter((dataSet) => dataSet.isCurrent)
          .map((dataSet) => ({
            datasetid:
              workunitIdRelationships?.[dataSet.datasetId!] ||
              dataSet.datasetId,
            datasetname: dataSet.datasetName,
            version: dataSet.version,
            elementid: issueInfo.elementId,
          })) || []),
        extraData
          ? {
              datasetid:
                workunitIdRelationships?.[extraData.dataSetId!] ||
                extraData.dataSetId,
              datasetname: extraData.dataSetName,
              version: parseInt(extraData.version),
              elementid: extraData.elementId,
            }
          : false,
      ].filter(Boolean),
      camerainfo: camera,
    };
    return qwebService.sendAndGetResult<{ issueId: string }>({
      actionname: "bimfaceprobleminfo",
      arguments: postArguments,
    });
  }
  // #endregion

  // #config 临时方案
  uploadPaper() {
    return qwebService.sendAndGetResult<{}>({
      actionname: "uploadpaper",
    });
  }

  updateprojectsetting() {
    return qwebService.sendAndGetResult<{}>({
      actionname: "updateprojectsetting",
    });
  }

  updatemajorsetting() {
    return qwebService.sendAndGetResult<{}>({
      actionname: "updatemajorsetting",
    });
  }
  // #endconfig

  // #region 文件选择器
  selectFileOrFolder(
    folder_id?: string,
    workunit_id?: string,
    filename?: string,
    format?: string,
  ) {
    return qwebService.sendAndGetResult<{}>({
      actionname: "selectfile",
      arguments: {
        workunit_id,
        folder_id,
        filename,
        format,
      },
    });
  }
  // #endregion
}

export interface UserInfo {
  userId: string;
  accessToken: string;
  userName: string;
}

export default new PanelService();
