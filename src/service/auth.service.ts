import { notification } from "antd";
import { isPanel } from "consts";
import { getLoginUrl } from "function/auth.func";
import { getCookie, setCookie } from "function/cookie.func";

export class AuthService {
  getToken(handleLogin = true) {
    const token = getCookie("accessToken");
    if (handleLogin && !token) {
      this.onError();
    }
    return token;
  }

  getUserId(handleLogin = true) {
    const userId = getCookie("userId");
    // return userId ?? "6399205335958287204";
    if (handleLogin && !userId) {
      this.onError();
    }
    return userId || "";
  }

  onError() {
    window.location.href = getLoginUrl();
    throw new Error("请重新登录");
  }
}

export interface RequestErrorHandler {
  onServerError(message?: string): void;

  onNotFound(message?: string): void;

  onUnauthorized(message?: string): void;

  onForbidden(message?: string): void;

  onInvalidParameters(message?: string): void;

  onUnknown(message?: string): void;
}

class WebRequestErrorHandler implements RequestErrorHandler {
  onServerError(message?: string): void {
    notification.error({
      message: "服务器内部错误",
      description: message ?? "请稍后重试",
    });
  }

  onNotFound(message?: string): void {
    notification.error({
      message: "接口不存在",
      description: message ?? "请检查 URL 和 HTTP Method",
    });
  }

  onUnauthorized(message?: string): void {
    notification.error({
      message: "用户未登录",
      description: message ?? "请重新登录",
    });
    setTimeout(() => {
      window.location.href = getLoginUrl();
    }, 2000);
  }

  onInvalidParameters(message?: string): void {
    notification.error({
      message: "参数错误",
      description: message ?? "请检查参数",
    });
  }

  onForbidden(message?: string): void {
    notification.error({
      message: "无权限访问",
      description: message ?? "请检查用户角色",
    });
  }

  onUnknown(message?: string): void {
    notification.error({
      message: "未知错误",
      description: `${message} 请查看控制台获取错误详情`,
    });
  }
}

class PanelRequestErrorHandler extends WebRequestErrorHandler {
  onUnauthorized() {
    notification.error({
      message: "用户未登录",
    });
    setCookie("userId", undefined);
    setCookie("accessToken", undefined);
  }
}

const requestErrorHandler: RequestErrorHandler = isPanel
  ? new PanelRequestErrorHandler()
  : new WebRequestErrorHandler();

export { requestErrorHandler };
