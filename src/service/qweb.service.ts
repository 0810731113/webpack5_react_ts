/* eslint-disable no-empty-function */
/* eslint-disable prefer-promise-reject-errors */
/* eslint-disable no-useless-constructor */
/* eslint-disable @typescript-eslint/no-shadow */
import { message, notification } from "antd";
import { isQtAvailable } from "consts";
import { QTRequest, QTResponse } from "page/PanelPage/model";
import { OperatorFunction, Subject, Subscription } from "rxjs";

declare const QCefClient: QTClient;
declare const QCefQuery: (query: QTQuery) => void;

interface QTClient {
  addEventListener(
    name: string,
    handler: (event: {
      messageId: string;
      CollaborationClientEvent: string;
    }) => void,
  ): void;
  invokeMethod(data: any, id: string): void;
}

interface QTQuery {
  request: string;
  onSuccess: (response: any) => void;
  onFailure: (errorCode: string, errorMessage: string) => void;
}

interface QTEvent<T = {}> {
  messageId?: string | null;
  CollaborationClientEvent: QTResponse<T>;
}

const qtSubject = new Subject<QTEvent>();

if (!isQtAvailable) {
  // message.error("非 QT 环境,无法初始化, 使用模拟消息服务", 10);
} else {
  QCefClient.addEventListener("__onQtMessage", (event) => {
    qtSubject.next({
      messageId: event.messageId,
      CollaborationClientEvent: JSON.parse(event.CollaborationClientEvent),
    } as QTEvent);
  });
}

interface IQWebService {
  // 发送消息，无需结果或报错
  directSend(request: QTRequest): void;
  // 发送消息，同时等待结果或报错
  sendAndGetResult<T>(request: QTRequest): Promise<T>;
  // TODO: 新引擎似乎不再需要
  sendAndWait<T>(request: QTRequest): Promise<QTResponse<T>>;
  // 订阅来自 QT 的消息
  // TODO: 有可能需要回写结果，场景尚未确认，暂未实现
  subscribe(
    handle: (message: QTEvent<any>) => void,
    filter?: OperatorFunction<QTEvent, QTEvent>,
  ): Subscription;
}

export class QWebService implements IQWebService {
  private qtChannel: QTClient = QCefClient;

  private requests: Map<{}, Promise<QTResponse<any>>> = new Map();

  constructor(public messageHistory: QTEvent[] = []) {}

  directSend(request: QTRequest) {
    QCefQuery({
      request: JSON.stringify(request),
      onSuccess: (response) => {
        console.log("directSend:onSuccess", request, response);
      },
      onFailure: (code, message) => {
        console.log("directSend:onFailure", request, code, message);
      },
    });
  }

  sendAndGetResult<T>(request: QTRequest): Promise<T> {
    return new Promise((resolve, reject) => {
      console.log("sent message:", request);
      QCefQuery({
        request: JSON.stringify(request),
        onSuccess: (res: any) => {
          try {
            let obj = res;
            if (typeof res === "string") {
              obj = JSON.parse(res);
            }

            const { response } = obj;
            if (response.status === "ok") {
              resolve({ ...(response.data || {}), readonly: false });
            } else if (response.status === "readonly") {
              resolve({ ...(response.data || {}), readonly: true });
            } else if (response.status === "cancel") {
              reject(-999);
            } else {
              // message.error(response.data.errormessage);
              reject(response.data.errornumber ?? -1);
            }
          } catch (e) {
            // message.error("返回数据格式错误:" + JSON.stringify(res));
            reject(-99);
          }
        },
        onFailure: (code, message) => {
          console.log("sendAndGetResult:onFailure", request, code, message);
          reject(code);
        },
      });
    });
  }

  sendAndWait(request: QTRequest) {
    return Promise.resolve({
      actionname: request.actionname,
      response: { status: "ok" as any, data: { echo: true } as any },
    });
  }

  subscribe(
    handle: (message: QTEvent) => void,
    filter?: OperatorFunction<QTEvent, QTEvent>,
  ): Subscription {
    if (filter) {
      return qtSubject.pipe(filter).subscribe((message) => {
        this.messageHistory.push(message);
        handle(message);
      });
    }
    return qtSubject.subscribe((message) => {
      this.messageHistory.push(message);
      handle(message);
    });
  }
}

export class FakeQWebService implements IQWebService {
  directSend(request: QTRequest) {
    console.log("sent message:", request);
    notification.info({
      message: "directSend",
      description: JSON.stringify(request),
    });
  }

  sendAndGetResult<T>(request: QTRequest) {
    console.log("sent message:", request);
    return Promise.resolve({ echo: true } as any);
  }

  sendAndWait(request: QTRequest) {
    console.log("sent message:", request);
    return Promise.resolve({
      actionname: request.actionname,
      response: { status: "ok" as any, data: { echo: true } as any },
    });
  }

  subscribe(
    handle: (message: QTEvent) => void,
    filter?: OperatorFunction<QTEvent, QTEvent>,
  ) {
    return new Subscription();
  }
}

const instance: IQWebService = isQtAvailable
  ? new QWebService()
  : new FakeQWebService();
export default instance;
