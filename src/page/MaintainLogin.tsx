import { Carousel, Tabs, Form, Input, Avatar, message, Divider } from "antd";
import { Button } from "component/Antd";
import consts from "consts";
import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { authService, loginService } from "service";
import "./LoginPage.scss";

const { PUBLIC_URL, ENV, NESTBIM_BASE_URL } = consts;

export interface LoginPageProps {}

export default function MaintainLogin(props: LoginPageProps) {
  const {} = props;
  const { replace } = useHistory();

  const redirect = () => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const toUrl = urlParams.get("returnUrl");
    if (toUrl) {
      window.location.href = toUrl;
    } else {
      replace("/workspace");
    }
  };

  const onFinish = (values: any) => {
    loginService
      .maintainLogin(values.username, values.password)
      .then((res) => {
        const response = res.data.data;

        if (ENV === "local") {
          window.location.href = `/workspace?accessToken=${response?.oAuth2AccessToken?.access_token}&userId=${response?.userInfo?.id}`;
        } else {
          redirect();
        }
      })
      .catch((err) => {
        if (err && err.code === 50002) {
          message.error("您暂不具备内测资格，请前往申请内测资格！");
        } else {
          message.error(err.msg ?? "系统错误");
        }
      });
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <div className="login-page">
      <div className="carousel">
        <img id="logo" src={`${PUBLIC_URL}/glodon.svg`} />

        <div
          className="slide"
          style={{
            backgroundImage: `url(${PUBLIC_URL}/assets/images/carousel1.jpg)`,
            width: "100%",
            height: "100%",

            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <h1>广联达协同设计平台</h1>
        </div>
      </div>

      <div className="frame">
        <div className="form">
          <div className="tab-content">
            <div style={{ width: "100%", textAlign: "center" }}>
              <img src={`${PUBLIC_URL}/gdcp_logo.png`} style={{ height: 40 }} />
            </div>
            <Form
              name="basic"
              initialValues={{ remember: true }}
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
            >
              <Form.Item
                name="username"
                rules={[{ required: true, message: "请输入账号名" }]}
              >
                <Input size="large" placeholder="请输入账号名" />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[{ required: true, message: "请输入登录密码" }]}
              >
                <Input.Password size="large" placeholder="请输入登录密码" />
              </Form.Item>

              <div className="forget-pwd">
                <a href="https://account.glodon.com/forgetInit" target="_blank">
                  忘记密码
                </a>
              </div>

              <Form.Item>
                <Button type="primary" htmlType="submit">
                  登录
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
        <div className="footer">
          <div className="offical-site">
            <a href={NESTBIM_BASE_URL} target="_blank">
              <img
                src={`${PUBLIC_URL}/glodon_logo.png`}
                style={{ height: 13 }}
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
