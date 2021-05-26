import React, { useEffect } from "react";
import { useImmer } from "use-immer";
import consts from "consts";
import axios from "axios";
import { Modal, Button, Form, Input, message, Empty } from "antd";
import { authService, loginService, userService } from "service";
import { useHistory, Link, useRouteMatch } from "react-router-dom";
import { SoftwareParams } from "model/route-params.model";

const { PUBLIC_URL, API_BASE_STRUC_URL } = consts;

export interface DownloadPageProps {}

export interface State {
  fileUrl: string;
}

export default function DownloadPage(props: DownloadPageProps) {
  const {} = props;

  const {
    url,
    path,
    params: { software },
  } = useRouteMatch<SoftwareParams>();

  const { replace } = useHistory();

  const [{ fileUrl }, updateState] = useImmer<State>({
    fileUrl: "",
  });

  const downloadUrl = () => {
    axios
      .get(
        `${API_BASE_STRUC_URL}/design/resource/signature/software/${software}/download/url`,
      )
      .then((res) => {
        const _url = res?.data?.data;
        if (_url) {
          window.open(_url, "_blank");
        } else {
          message.error("下载失败，请稍后再试");
        }
      })
      .catch((err) => message.error("下载失败，请稍后再试"));
  };

  useEffect(()=>{
    userService.me();
  },[])


  if (software === "garch" || software === "gmep" || software === "gstr") {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          paddingTop: 300,
          justifyContent: "center",
        }}
      >
        <div style={{ width: 460, textAlign: "center" }}>
          <img
            src={`${PUBLIC_URL}/${software}_logo.png`}
            style={{ height: 72, marginBottom: 32 }}
            alt="software_logo"
          />

          <Button
            type="primary"
            size="large"
            style={{
              width: "100%",
              borderRadius: 30,
              fontSize: 24,
              height: 60,
            }}
            onClick={() => downloadUrl()}
          >
            立即下载
          </Button>
          <div style={{ marginTop: 24, fontSize: 14 }}>
            请确保您有广联达设计账号才能使用该软件，软件大小：约500M
          </div>
        </div>
      </div>
    );
  }

  return <Empty />;
}