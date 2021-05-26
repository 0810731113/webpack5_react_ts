import { useImmer } from "use-immer";
import { useEffect, useState, useRef } from "react";
import { systemService } from "service";

interface State {
  msg: string;
  isAppUsable: boolean;
  checking: boolean;
}

const defaultMsg = "default block message";

export default function useCheckAppVersion() {
  const [{ msg, isAppUsable, checking }, updateState] = useImmer<State>({
    msg: defaultMsg,
    isAppUsable: true,
    checking: true,
  });

  const check = () => {
    systemService.checkPanelVersionUseable().then((res) => {
      updateState((draft) => {
        draft.checking = false;
        draft.isAppUsable = res?.usable ?? true;
        draft.msg = res?.message ?? defaultMsg;
      });
    });
  };

  useEffect(() => {
    check();
  }, []);

  return { message: msg, isAppUsable, recheck: check };
}