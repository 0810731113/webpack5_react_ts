import { getCookie } from 'function/cookie.func';
import consts from "consts";
import { notification, Modal } from "antd";
import { AxiosError, AxiosResponse } from "axios";

import { requestErrorHandler as handler } from "service/auth.service";

const { AUTH_BASE_URL, PUBLIC_URL } = consts;

export function getOldLoginUrl(returnUrl?: string) {
  returnUrl = returnUrl ?? window.location.href;
  return `${AUTH_BASE_URL}/login?returnUrl=${encodeURI(returnUrl)}`;
}

export function getLoginUrl(returnUrl?: string) {
  returnUrl = returnUrl ?? window.location.href;
  return `${PUBLIC_URL}?returnUrl=${encodeURIComponent(returnUrl)}`;
  // return `${AUTH_BASE_URL}/login?returnUrl=${encodeURI(returnUrl)}`;
}

export function getPanelUrl() {
  return `${PUBLIC_URL}/panel?isPanel=true&accessToken=${getCookie(
    "accessToken",
  )}&userId=${getCookie("userId")}&productName=${getCookie(
    "productName",
  )}&productVersion=${getCookie("productVersion")}`;
}

export function onResponseError(error: AxiosError) {
  console.error(error);

  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    const { status } = error.response;
    if (status >= 500) {
      handler.onServerError(error.message);
    } else if (status === 400) {
      handler.onInvalidParameters(error.message);
    } else if (status === 401) {
      handler.onUnauthorized(error.message);
    } else if (status === 403) {
      handler.onForbidden(error.message);
    } else if (status === 404) {
      handler.onNotFound(error.message);
    } else {
      handler.onUnknown(error.message);
    }
  } else if (error.request) {
    // The request was made but no response was received
    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
    // http.ClientRequest in node.js
    notification.error({
      message: "服务器无响应",
      description: error.message ?? "请检查网络设置",
    });
  } else {
    // Something happened in setting up the request that triggered an Error
    notification.error({
      message: "数据请求错误",
      description: error.message,
    });
  }
}
