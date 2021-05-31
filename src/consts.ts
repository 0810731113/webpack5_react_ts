import Axios from "axios";
import { setCookie } from "function/cookie.func";
import { keys } from "lodash";

// eslint-disable-next-line global-require
const platform = require("platform-detect") ?? {};

// console.log("platform:", platform);
export const TALKING_DATA_URL = process.env.REACT_APP_TALKINGDATA_URL;
export const CITY_CODE_URL = process.env.REACT_APP_CITYCODE_URL;

export interface Consts {
  API_BASE_URL: string;
  API_BASE_STRUC_URL: string;
  API_BASE_STORE_URL: string;
  API_BASE_BIMFACE_URL: string;
  API_BASE_BIMCODE_URL: string;
  API_BASE_SYSTEM_URL: string;
  API_BASE_STAT_URL: string;
  API_BASE_AUTHORIZATION_URL: string;
  GJW_URL: string;
  GJW_STATIC_URL: string;
  GMEP_URL: string;
  CLASH_URL: string;
  AUTH_BASE_URL: string;
  MESSAGE_BASE_URL: string;
  LOGOUT_URL: string;
  LOGIN_RETURN_URL: string;
  PUBLIC_URL: string;
  ENV: string;
  NESTBIM_BASE_URL: string;

  EXTENTION_SS_URL: string;
  EXTENSION_CLEARHEIGHT_URL: string;
  EXTENSION_MODELCHECK_URL: string;
}

// export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL!;
// export const API_BASE_STRUC_URL = process.env.REACT_APP_API_BASE_STRUC_URL!;
// export const API_BASE_STORE_URL = process.env.REACT_APP_API_BASE_STORE_URL!;
// export const API_BASE_BIMFACE_URL = process.env.REACT_APP_API_BASE_BIMFACE_URL!;
// export const API_BASE_BIMCODE_URL = process.env.REACT_APP_API_BASE_BIMCODE_URL!;
// export const API_BASE_SYSTEM_URL = process.env.REACT_APP_API_BASE_SYSTEM_URL!;
// export const BASE_GJW_URL = process.env.REACT_APP_GJW_URL!;
// export const BASE_GJW_STATIC_URL = process.env.REACT_APP_GJW_STATIC_URL!;
// export const CLASH_URL = process.env.REACT_APP_CLASH_URL;
// export const LOGIN_URL = process.env.REACT_APP_LOGIN_URL;
// export const LOGOUT_URL = process.env.REACT_APP_LOGOUT_URL;
// export const LOGIN_RETURN_URL = process.env.REACT_APP_LOGIN_RETURN_URL;
// export const PUBLIC_URL = process.env.PUBLIC_URL;
// export const ENV = process.env.REACT_APP_ENV;

export const IS_PROD = process.env.NODE_ENV === "production";
export const IS_MAC = (platform.macos || platform.ios) ?? false;

declare const QCefClient: any;
export const isQtAvailable = typeof QCefClient !== "undefined";

export const defaultScrollbarSettings = {
  autoHide: true,
  autoHideDuration: 2000,
  className: "scroll-wrap",
  style: { marginRight: 0, marginBottom: 0 },
};
export const defaultDrawerSettings = {
  getContainer: false,
  style: { position: "absolute", zIndex: 1, overflow: "hidden" },
} as any;

export const NAV = {
  overviewBoard: "overviewBoard",
  personalSection: "personalSection",
  collaborationSection: "collaboration",
  collaborationWorkspace: "collaborationWorkspace",
  collaborationWorkUnit: "collaborationWorkUnit",
  collaborationReceivedPackages: "collaborationReceivedPackages",
  collaborationSharedPackages: "collaborationSharedPackages",
  collaborationIssues: "collaborationIssues",
  collaborationFiles: "collaborationFiles",
  projectArchive: "projectArchive",
  projectWorkUnitIntegrate: "projectWorkUnitIntegrate",
  appsSection: "apps",
  workUnitSection: "workUnit",
  workUnitInProcess: "workUnitInProcess",
  settingsSection: "settings",
  settingsProjectOverview: "settingsProjectOverview",
  settingsProjectSettings: "settingsProjectSettings",
  settingsZhouWang: "settingsZhouWang",
  settingsKongJianBiaoGao: "settingsKongJianBiaoGao",
  settingsGouJianKu: "settingsGouJianKu",
  settingsYangShiKu: "settingsYangShiKu",
  settingsJianZhu: "settingsJianZhu",
  settingsJiDian: "settingsJiDian",
};

export const formSchemaData = (schemaKey: string, data: Object) => {
  const appKey = "BIM-MODEL";
  const schemaVersion = 1;

  const obj = { appKey, schemaVersion, schemaKey, data };

  return obj;
};

export const generateGridSchema = (schemaKey: string, data: Object) => {
  const appKey = "BIM-MODEL";
  const schemaVersion = 3;
  return { appKey, schemaVersion, schemaKey, data };
};

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const accessToken = urlParams.get("accessToken");
const userId = urlParams.get("userId");
const productName = urlParams.get("productName");
const productVersion = urlParams.get("productVersion");
export const isPanel = urlParams.get("isPanel");

if (!!accessToken && !!userId) {
  if (window.BroadcastChannel) {
    const channel = new BroadcastChannel("cookieChannel");
    channel.postMessage("userChange");
  }
  setCookie("accessToken", accessToken);
  setCookie("userId", userId);
  setCookie("productName", productName);
  setCookie("productVersion", productVersion);
  if (process.env.NODE_ENV !== "development") {
    urlParams.delete("accessToken");
    urlParams.delete("userId");
    urlParams.delete("productName");
    // eslint-disable-next-line no-restricted-globals
    history.replaceState(
      null,
      "",
      `${window.location.href.split("?")[0]}?${urlParams.toString()}`,
    );
  }
}

/**
 * 默认填入生产环境，以防加载失败
 */
const envApi = "gdc-qastg"; // 如需debug,只用改这个就好
const apiHost = `https://apigate-test.glodon.com/${envApi}`; // 过网关
const apiNoGate = `https://${envApi}.glodon.com`; // 不过网关
const local = "http://10.4.35.162:8080";

const CONSTS: Consts = {
  API_BASE_URL: `${apiHost}/bimmodel`,
  API_BASE_STRUC_URL: `${apiHost}/structure`,
  API_BASE_STORE_URL: `${apiHost}/store`,
  API_BASE_BIMFACE_URL: `${apiHost}/bfproxy`,
  API_BASE_BIMCODE_URL: `${apiHost}/bimcode`,
  API_BASE_SYSTEM_URL: `${apiNoGate}/system`,
  API_BASE_STAT_URL: `${apiHost}/stat`,
  API_BASE_AUTHORIZATION_URL: `${apiHost}/authorization`,
  AUTH_BASE_URL: `${apiNoGate}/auth`,
  MESSAGE_BASE_URL: "wss://gdc-de.glodon.com/messaging/connect",
  NESTBIM_BASE_URL: "https://design-test.glodon.com",

  GMEP_URL: "https://mep-qa.glodon.com/projectSetting_qa/#/pipeSystem",
  CLASH_URL: "http://10.4.35.43:8088",
  GJW_STATIC_URL: "https://static-test.goujianwu.com",
  GJW_URL: "https://iframe-dev.goujianwu.com",

  EXTENTION_SS_URL:
    process.env.REACT_APP_EXTENTION_SS_URL ??
    "https://cloud.shapespark.com.cn/gdcp/open",
  EXTENSION_CLEARHEIGHT_URL:
    process.env.REACT_APP_EXTENTION_SS_URL ?? "/clearheighthost",
  EXTENSION_MODELCHECK_URL:
    process.env.REACT_APP_EXTENTION_SS_URL ??
    "http://gdc-qa.yunzu360.com/#/authorize",

  LOGOUT_URL: "http://localhost:7000/logout",
  LOGIN_RETURN_URL: "http://localhost:7000/web/workspace",
  ENV: "local",
  PUBLIC_URL: "/web",
};

// const host =
//   window.location.host.toLowerCase().trim().indexOf("localhost") === -1
//     ? window.location.host.toLowerCase().trim()
//     : "gdc-de.glodon.com";

const host = window.location.host.toLowerCase().trim();

// 根据 URL HOST 判断当前环境
function detectHost(): string {
  return host.split(".")[0];
}

export function detectEnv() {
  const _host = detectHost();

  switch (_host) {
    case "gdc-de":
      return "de";
    case "gdc-qa":
      return "qa";
    case "gdc-qastg":
      return "qastg";

    default:
      return _host;
  }
}

export function loadConfig() {
  if (host.indexOf("localhost") > -1) {
    return Promise.resolve();
  }
  return Axios.get(
    `https://${host}/configure/apollo/${"Web"}/${detectHost()}?configName=url`,
  )
    .then((res) => {
      const data = res?.data?.data || {};
      // const data = process.env || {};
      keys(data).forEach((key) => {
        const splitKey = key.split(".");
        (CONSTS as any)[
          splitKey[splitKey.length - 1]?.replace("REACT_APP_", "")
        ] = data[key];
      });
    })
    .catch(console.error);
}

export default CONSTS;
