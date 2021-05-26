import { getCookie } from "function/cookie.func";
import { Client, StompSubscription } from "@stomp/stompjs";

import consts from "consts";

Object.assign(global, { WebSocket: require("websocket").w3cwebsocket });
const { MESSAGE_BASE_URL } = consts;

interface SubscriptionParam {
  index: number;
  channel: string;
  handle: (type: string, info: string) => void;
}

interface SubscriptionData {
  subscription: StompSubscription | null;
  channel: string;
  handle: (type: string, info: string) => void;
}

class SocketClient {
  _instance: Client;

  _index: number;

  _scriptionsQueue: SubscriptionParam[];

  _subscriptions: { [index: number]: SubscriptionData };

  constructor(baseUrl: string) {
    const token = getCookie("accessToken");
    const config = {
      brokerURL: baseUrl,
      // debug: (str: string) => {
      //   console.log("debug:", str);
      // },
      reconnectDelay: 10000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    };

    this._instance = new Client({
      ...config,
      ...(token ? { connectHeaders: { token } } : {}),
    });

    this._instance.onStompError = (frame) => {
      console.log("onStompError:", frame);
    };

    this._scriptionsQueue = [];
    this._subscriptions = {};
    this._index = 0;
  }

  connect() {
    this._instance.onConnect = (frame) => {
      console.log("wss connected: userId ", frame.headers["user-name"]);

      for (const num in this._subscriptions) {
        const data = this._subscriptions[num];

        if (data.subscription) {
          this.subscribe(data.channel, data.handle, parseInt(num));
        }
      }

      while (this._scriptionsQueue.length > 0) {
        const tmp = this._scriptionsQueue.pop();
        if (tmp) {
          this.subscribe(tmp.channel, tmp.handle, tmp.index);
        }
      }
    };

    this._instance.activate();
  }

  forceDisconnect() {
    this._instance.forceDisconnect();
  }

  updateToken() {
    const token = getCookie("accessToken");
    if (token) {
      this._instance.deactivate();
      this._instance.configure({
        connectHeaders: { token },
      });
      this._instance.activate();
    }
  }

  subscribe(
    channel: string,
    handle: (type: string, info: string) => void,
    index: number,
  ) {
    let subscription = null;

    subscription = this._instance.subscribe(channel, (message) => {
      console.log("received topic a:", message.body);

      const body = JSON.parse(message.body);
      handle(body.messageCode, body.messageInfo);
    });

    console.log(`channel subscribed:  + ${channel}(${index})`);
    this._subscriptions[index] = { subscription, channel, handle };
  }

  handleSubscribe(
    channel: string,
    handle: (type: string, info: string) => void,
  ) {
    this._index++;
    if (this._instance.connected && this._instance.active) {
      this.subscribe(channel, handle, this._index);
    } else {
      this._scriptionsQueue.push({ channel, handle, index: this._index });
    }

    return this._index;
  }

  handleUnSubscribe(index: number, channel: string) {
    const subscription = this._subscriptions[index];
    if (subscription && subscription.subscription) {
      subscription.subscription.unsubscribe();

      // delete this._subscriptions[index];
      console.log(`channel unsubscribed: ${channel} (${index}) `);
    }

    // 若还未初始化，删除queue
    const queueIndex = this._scriptionsQueue.findIndex(
      (item) => item.index === index,
    );
    if (queueIndex >= 0) {
      this._scriptionsQueue.splice(queueIndex, 1);
    }
  }
}

const instance = new SocketClient(MESSAGE_BASE_URL);
export default instance;
