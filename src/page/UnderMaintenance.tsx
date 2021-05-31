import { Button, Result, Divider } from "antd";
import React, { useEffect, useState } from "react";
import { Link, Redirect , useHistory } from "react-router-dom";
import "./LandingPage.scss";
import consts from "consts";
import { systemService } from "service";

import useCheckMaintenance from "hook/use-check-maintenance.hook";
import useCheckAppVersion from "hook/use-check-appversion";

const { PUBLIC_URL } = consts;
export const WebMaintenance = () => {
  const { message } = useCheckMaintenance("WEB", undefined, undefined, () =>
    window.location.assign(PUBLIC_URL),
  );

  return <UnderMaintenance message={message} />;
};
export const PanelMaintenance = () => {
  const history = useHistory();
  const { message: blockMsg, isAppUsable, recheck } = useCheckAppVersion();

  const { message, status } = useCheckMaintenance("PANEL");

  return <UnderMaintenance message={isAppUsable ? message : blockMsg} />;
};

interface UnderMaintenanceProps {
  message: string;
}

function UnderMaintenance(props: UnderMaintenanceProps) {
  const { message } = props;

  const defaultMsg = "亲爱的用户！";

  return (
    <div className="under-maintenance">
      <div className="frame">
        <div className="block">
          <img src={`${PUBLIC_URL}/maintenance2.png`} />
          <div id="announce2">
            <div className="title">
              <Divider className="divider-title">
                <img
                  src={`${PUBLIC_URL}/maintenance.png`}
                  style={{ width: 30, height: 30, marginRight: 12 }}
                />
                服务器维护公告
              </Divider>
            </div>
            <div className="info">{message ?? defaultMsg}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
