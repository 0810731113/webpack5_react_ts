import wssService from "service/websocket.service";

import React, { useEffect } from "react";

export function useInitWss() {
  useEffect(() => {
    wssService.connect();

    return () => {
      wssService.forceDisconnect();
    };
  }, []);
}
