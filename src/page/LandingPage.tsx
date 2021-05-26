import { Carousel, Space, Divider } from "antd";
import { Button } from "component/Antd";
import consts from "consts";
import { getOldLoginUrl } from "function/auth.func";
import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { authService } from "service";
import "./LandingPage.scss";
import { useImmer } from "use-immer";
import useCheckMaintenance from "hook/use-check-maintenance.hook";

const { LOGIN_RETURN_URL, PUBLIC_URL } = consts;

export interface LandingPageProps {}

export interface State {
  showAnnounce: boolean;
}

export default function LandingPage(props: LandingPageProps) {
  const {} = props;
  const { replace } = useHistory();

  // const { status: sysStatus, message } = useCheckMaintenance("WEB");

  // if (authService.getToken(false) && authService.getUserId(false)) {
  //   replace("/workspace");
  //   return null;
  // }

  return (
    <div className="landing-page">
      <div className="line" />

      <div className="frame">
        <Carousel effect="fade" autoplay autoplaySpeed={5000}>
          {[
            `${PUBLIC_URL}/assets/images/cover1.jpg`,
            `${PUBLIC_URL}/assets/images/cover2.jpg`,
            `${PUBLIC_URL}/assets/images/cover3.jpg`,
            `${PUBLIC_URL}/assets/images/cover6.jpg`,
          ].map((url) => (
            <div>
              <div
                className="slide"
                style={{
                  backgroundImage: `url(${url})`,
                }}
               />
            </div>
          ))}
        </Carousel>
        <div className="text">
          <div className="title">设计协同</div>
          <p>
            紧紧围绕工程建设全生命周期业务，立足BIM、物联网、移动互联网、大数据和云计算等技术，为政府、业主、施工、咨询、设计和运营等参建方提供优质的产品和服务，帮助用户提升效率、
            降低成本、有效规划以及其他维度的更多收益。
          </p>
        </div>
        <div className="login">
          <Space
            direction="vertical"
            style={{ width: "100%", textAlign: "center" }}
          >
            <Button
              type="primary"
              size="large"
              block
              style={{ boxShadow: "0px 0px 33px -8px rgba(222,222,220, 1)" }}
            >
              <a href={getOldLoginUrl(LOGIN_RETURN_URL)}>登录</a>
            </Button>

            <img src={`${PUBLIC_URL}/glodon.svg`} style={{ width: 100 }} />
          </Space>
        </div>

        {/* {sysStatus === "PreMaintenance" && (
          <div className="landing-announce">
            <div id="announce">
              <div className="title">
                <Divider className="divider-title">
                  <img
                    src={`${PUBLIC_URL}/maintenance.png`}
                    style={{ width: 30, height: 30, marginRight: 12 }}
                  />
                  服务器维护公告
                </Divider>
              </div>
              <div className="info" style={{ opacity: 0.85 }}>
                {message}
              </div>
            </div>
          </div>
        )} */}
      </div>
    </div>
  );
}
