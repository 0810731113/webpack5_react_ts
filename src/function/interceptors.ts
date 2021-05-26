/* eslint-disable no-useless-catch */
import consts, { isPanel } from "consts";
import { isInteger, isPlainObject, isString } from "lodash";
import { AxiosError, AxiosResponse, AxiosInstance } from "axios";
import { message as AntdMsg, Modal } from "antd";
import { getCookie, setCookie } from "function/cookie.func";
import axiosRetry from "axios-retry";
import { userService, authService } from "service";
import panelService from "service/panel.service";
import { loginService } from "service";
import { popupError } from "./apiCommonError";
import { getPanelUrl } from "./auth.func";

const handleVersionDeleted = (apiCategory?: string) => {
  if (!popupError.deleted) {
    const isJsOpened = !!window.opener;
    popupError.deleted = true;
    popupError.modal = Modal.warning({
      content:
        apiCategory === "version"
          ? `此版本已删除，请刷新当前界面`
          : `相关版本已被删除，暂不支持定位查看`,
      okText: isJsOpened ? `关闭窗口` : `刷新页面`,
      onOk() {
        if (!isPanel) {
          if (isJsOpened) {
            window.close();
          } else {
            window.location.reload();
          }
        }
      },
    });
  }
};

export function handleWrappedResponse(
  response: AxiosResponse,
  apiCategory?: string,
) {
  if (!response || !response.data) return response;

  if (isPlainObject(response.data)) {
    const { code, msg } = response.data;
    if (isInteger(code) && code === 46001) {
      // 维护中
      window.location.reload();
      // window.location.href = "/maintenance" + window.location.search;
    } else if (isInteger(code) && code === 52011) {
      // 无权限
      AntdMsg.error("您已切换账号");
      setTimeout(() => {
        if (isPanel) {
          window.location.href = getPanelUrl();
        } else {
          window.location.href = "/";
        }
      }, 1500);
    } else if (isInteger(code) && code === 52010) {
      // 无权限
      AntdMsg.error("您无权限或您的权限已被修改");
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } else if (isInteger(code) && code === 40020) {
      handleVersionDeleted(apiCategory);
    } else if (isInteger(code) && code === 50012) {
      if (!popupError.deleted) {
        popupError.deleted = true;
        popupError.modal = Modal.warning({
          title: "您的账号已禁用",
          content: `如有疑问请联系客服人员。`,
          okText: `确定`,
          onOk() {
            if (isPanel) {
              panelService.logout();
            } else {
              loginService.logout();
            }
          },
        });
      }
    } else if (isInteger(code) && code === 40018) {
      if (!popupError.deleted) {
        popupError.deleted = true;
        popupError.modal = Modal.warning({
          title: "此项目已被删除",
          content: `如有疑问请联系相关负责人。`,
          okText: `确定`,
          onOk() {
            // popupError.deleted = false;
            if (isPanel) {
              window.location.href = getPanelUrl();
            } else {
              window.location.href = "/";
            }
          },
        });
      }
    } else if (isInteger(code) && code !== 10000 && code !== 0) {
      // eslint-disable-next-line no-throw-literal
      throw {
        status: 900,
        message: `code: ${code}, message: ${msg}`,
        response,
        config: response.config,
        request: response.request,
      };
    } else if (isString(code) && code !== "success") {
      // eslint-disable-next-line no-throw-literal
      throw {
        status: 900,
        message: `code: ${code}, message: ${msg}`,
        response,
        config: response.config,
        request: response.request,
      };
    }
  }
  return response;
}

export function AddInterceptors(ax: AxiosInstance, apiCategory?: string) {
  if (apiCategory === "apply" || apiCategory === "system") {
    ax.interceptors.request.use((request) => {
      request.headers = request.headers || {};
      // request.headers["x-gdc-userid"] = authService.getUserId();
      if (getCookie("accessToken")) {
        request.headers.Authorization = `bearer ${getCookie("accessToken")}`;
      }

      return request;
    });
  } else if (apiCategory === "enterprise") {
    ax.interceptors.request.use((request) => {
      request.headers = request.headers || {};
      if (getCookie("accessToken")) {
        request.headers.Authorization = `Bearer ${getCookie("accessToken")}`;
      }

      return request;
    });
  } else if (apiCategory !== "login") {
    ax.interceptors.request.use((request) => {
      request.headers = request.headers || {};
      request.headers["x-gdc-userid"] = authService.getUserId();
      request.headers.Authorization = `bearer ${authService.getToken()}`;
      return request;
    });
  }

  ax.interceptors.response.use(handleWrappedResponse, (error) => {
    if (error.config["axios-retry"].retryCount === 3 && !error.response) {
      AntdMsg.error("网络故障, 请重新登录");
      window.location.href = `${consts.PUBLIC_URL}/logout`;
      return;
    }
    try {
      handleWrappedResponse(error.response, apiCategory);
      return Promise.reject(error);
    } catch (e) {
      throw e;
    }
  });

  axiosRetry(ax, {
    retries: 3,
    retryDelay: (retryCount) => retryCount * 1000,
  });
}
