/* eslint-disable no-bitwise */
import { authService } from "service";
import consts from "consts";
import Axios from "axios";
import { getCookie, setCookie } from "./cookie.func";

const { ENV } = consts;

declare const TDAPP: any;

declare global {
  interface Window {
    TDAPP: string;
  }
}

function guid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
/**
 * 发送用户行为数据到 Talking Data
 * @param eventName 用户行为名
 * @param label 任意字符串，用于子类别，可选
 * @param options 任意附属信息
 */
export async function publishEvent(
  eventName: string,
  modules?: string[],
  options?: { [key: string]: string[] | string | number | undefined },
) {
  // if (!window.TDAPP || !TDAPP) return;

  options = options ?? {};
  const userId = authService.getUserId(false);
  // if (userId) {
  //   options.userId = options.userId || userId;
  // }
  const pathnames = window.location.pathname.split("/");
  const projectsPathnameIndex = pathnames.indexOf("projects");
  if (pathnames[projectsPathnameIndex + 1]) {
    options.projectId = pathnames[projectsPathnameIndex + 1];
  }
  options.eventType = options.eventType || "主动";
  delete options.eventLevel;
  // options.eventLevel = options.eventLevel || "P3";
  // options.modules = modules;
  let uuid = getCookie("uuid");
  if (!uuid) {
    uuid = Date.parse(new Date().toString()).toString();
    setCookie("uuid", uuid);
  }
  try {
    const url =
      ENV === "local"
        ? "/"
        : ENV === "production"
        ? "https://api.goujianwu.com/general/tracks"
        : ENV === "qa"
        ? "https://api-test.goujianwu.com/general/tracks"
        : ENV === "development"
        ? "https://api-dev.goujianwu.com/general/tracks"
        : "";
    if (url) {
      const res = await fetch(url, {
        method: "POST",
        body: JSON.stringify({ event: eventName, params: options }),
        headers: {
          "Local-pid": "GTeam",
          "Local-uid": options.userId?.toString() || userId || uuid,
          "Content-Type": "application/json",
        },
      });
      console.log(res);
    }
  } catch (e) {
    console.log(e);
  }

  // TDAPP.onEvent(eventName, ENV || "local", options);
}
