import wssService from "service/websocket.service";
import { useImmer } from "use-immer";
import { useHistory } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { systemService } from "service";

interface State {
  msg: string;
  status: "Running" | "PreMaintenance" | "PostMaintain" | "UnderMaintenance";
}

export default function useCheckMaintenance(
  client: "APP" | "WEB" | "PANEL" | "COMMON",
  onPreMaintenance?: () => void,
  onMaintenance?: () => void,
  onPostMaintenance?: () => void,
) {
  const period = 1000 * 5; // ms
  const defaultMsg =
    "亲爱的用户，服务器正在维护中，给各位带来的不便，敬请谅解！";

  const history = useHistory();

  const [{ msg, status }, updateState] = useImmer<State>({
    msg: defaultMsg,
    status: "Running",
  });

  const checkStatus = (needRefresh?: boolean) => {
    return systemService.getSystemStatus().then((res) => {
      const status = res?.currentMaintainStatus;
      switch (status) {
        case "UnderMaintenance":
          if (needRefresh) window.location.reload();
          //history.replace("/maintenance");
          break;
        case "PostMaintain":
          onPostMaintenance && onPostMaintenance();
          updateState((draft) => void (draft.status = status!));
          break;

        default: {
          if (status) {
            updateState((draft) => void (draft.status = status!));
          }
        }
      }
    });
  };

  const getMessage = () => {
    systemService.getMessage(client).then((msg) => {
      updateState((draft) => void (draft.msg = msg ?? ""));
    });
  };

  useEffect(() => {
    checkStatus();
    const id = wssService.handleSubscribe(
      "/topic/MaintainMessage",
      (type, info) => {
        if (type === "MaintainRefresh") {
          checkStatus(true);
        }
      },
    );

    return () => {
      wssService.handleUnSubscribe(id, "/topic/MaintainMessage");
    };
  }, []);

  useEffect(() => {
    getMessage();
  }, [status]);

  return { message: msg, status };
}
