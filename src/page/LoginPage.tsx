import {
  Carousel,
  Tabs,
  Form,
  Input,
  Avatar,
  message,
  Divider,
  Space,
  Tooltip,
} from "antd";
import { Button } from "component/Antd";
import consts from "consts";
import React, { useState, useEffect } from "react";
import { useHistory, Link, useRouteMatch } from "react-router-dom";
import { authService, loginService } from "service";
import "./LoginPage.scss";
import useCheckMaintenance from "hook/use-check-maintenance.hook";
import { useImmer } from "use-immer";
import wssService from "service/websocket.service";
import { publishEvent } from "function/stats.func";
import { SwapOutlined } from "@ant-design/icons";
import Iconfont from "component/Iconfont";

const { NESTBIM_BASE_URL, PUBLIC_URL, ENV } = consts;
const { TabPane } = Tabs;

export interface LoginPageProps {}

export interface State {
  // showAnnounce: boolean;
  activeTab: string;
}

export default function LoginPage(props: LoginPageProps) {
  const {} = props;
  const { replace } = useHistory();

  const [{ activeTab }, updateState] = useImmer<State>({
    activeTab: "login",
  });
  const { path, url } = useRouteMatch();
  const [form] = Form.useForm();
  const { status: sysStatus, message: maintainText } = useCheckMaintenance(
    "WEB",
  );
  useEffect(() => {
    publishEvent(`visitSignIn`, ["基础"], { eventLevel: "P1" });
  }, []);

  const redirect = () => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const toUrl = urlParams.get("returnUrl");
    if (toUrl) {
      window.location.href = decodeURIComponent(toUrl);
    } else {
      replace("/workspace");
      wssService.updateToken();
    }
  };

  if (authService.getToken(false) && authService.getUserId(false)) {
    redirect();
    return null;
  }

  const onFinish = (values: any) => {
    loginService
      .login(values.username, values.password)
      .then((res) => {
        const response = res.data.data;

        publishEvent(`signIn`, ["基础"], {
          eventLevel: "P1",
          userId: response?.userInfo?.id,
        });

        if (ENV === "local") {
          window.location.href = `/workspace?accessToken=${response?.oAuth2AccessToken?.access_token}&userId=${response?.userInfo?.id}`;
        } else {
          redirect();
        }
      })
      .catch((error) => {
        const err = error?.response?.data;
        if (err?.code === 50002) {
          message.error("您暂不具备内测资格，请前往申请内测资格！");
          updateState((draft) => {
            draft.activeTab = "apply";
          });
        } else {
          message.error(err.msg ?? "系统错误");
        }
      });
  };
  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
  };

  // useEffect(() => {
  //   publishEvent(`打开登录页`, {
  //     前向来源: document.referrer ?? "URL直达",
  //   });
  // }, []);

  const isIndividual = path === "/";
  return (
    <div className="login-page">
      <div className="carousel">
        {/* <img id="logo" src={`${PUBLIC_URL}/glodon.svg`} /> */}

        {sysStatus === "PreMaintenance" && (
          <div className="announce">
            <div id="announce">
              <div className="title">
                <Divider className="divider-title">服务器维护公告</Divider>
              </div>
              <div className="info" style={{ opacity: 0.85 }}>
                {maintainText}
              </div>
            </div>
          </div>
        )}

        <Carousel effect="fade" autoplay autoplaySpeed={2800}>
          <div>
            <div
              className="slide"
              style={{
                backgroundImage: `url(${PUBLIC_URL}/assets/images/carousel0.jpg)`,
              }}
            >
              <div className="mask">
                <div className="content" style={{ width: "47vw" }}>
                  <div className="title">连接，让设计更有价值</div>
                  <div className="text">
                    广联达协同设计平台以构件级设计数据为核心，提供全专业、全过程、全参与方的协同设计解决方案
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <div
              className="slide"
              style={{
                backgroundImage: `url(${PUBLIC_URL}/assets/images/carousel1.jpg)`,
              }}
            >
              <div className="mask">
                <div className="content" style={{ width: "46vw" }}>
                  <div className="title">端+云数据服务，随时开展协同工作</div>
                  <div className="text">
                    紧密连接广联达设计产品，支持工具和云两端数据协作互联，提供设计协同与管理一站式解决方案
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <div
              className="slide"
              style={{
                backgroundImage: `url(${PUBLIC_URL}/assets/images/carousel2.jpg)`,
              }}
            >
              <div className="mask">
                <div className="content" style={{ width: "44vw" }}>
                  <div className="title">
                    <span>构件级协同设计，开创协作新模式</span>
                  </div>
                  <div className="text">
                    实现构件级设计协作方式，支撑设计数据高效精准传递、按需提取和多元化应用，改变协作模式，提升协同效率
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <div
              className="slide"
              style={{
                backgroundImage: `url(${PUBLIC_URL}/assets/images/carousel3.jpg)`,
              }}
            >
              <div className="mask">
                <div className="content" style={{ width: "49vw" }}>
                  <div className="title">
                    <span>一体化协同合作，赋能建筑全生命周期</span>
                  </div>
                  <div className="text">
                    统一数据标准，连接设计全专业，助力实现设计-算量-施工一体化目标，赋能建筑全生命周期
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <div
              className="slide"
              style={{
                backgroundImage: `url(${PUBLIC_URL}/assets/images/carousel4.jpg)`,
              }}
            >
              <div className="mask">
                <div className="content" style={{ width: "45vw" }}>
                  <div className="title">
                    <span>生态化数据应用，拓展设计数据价值</span>
                    {/* <span className="subtitle">全参与方</span> */}
                  </div>
                  <div className="text">
                    以设计数据为核心，搭建应用开放平台，满足基于数据标准的全场景拓展，为设计提供全产业链应用生态，探索设计数据更多价值
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Carousel>
      </div>

      <div className={["frame", isIndividual ? "personal" : ""].join(" ")}>
        <div className="form">
          <div className="tab-content">
            <div style={{ width: "100%", textAlign: "center" }}>
              <Space
                split={
                  <Divider
                    type="vertical"
                    style={{
                      width: 2,
                      backgroundColor: "#0080cb",
                    }}
                  />
                }
              >
                <img
                  src={`${PUBLIC_URL}/gdcp_logo.png`}
                  style={{ height: 40 }}
                />
                <span>
                  {isIndividual ? "个人版" : "企业版"}
                  <Tooltip
                    placement="bottom"
                    title={`切换为${!isIndividual ? "个人版" : "企业版"}`}
                  >
                    <Link
                      to={`${isIndividual ? "/enterprise" : "/"}${
                        window.location.search
                      }`}
                      className="switch-link"
                      onClick={() => form.resetFields()}
                    >
                      <Iconfont
                        type="icon-qiehuan"
                        style={{ marginLeft: 4, fontSize: 16 }}
                      />
                    </Link>
                  </Tooltip>
                </span>
              </Space>
            </div>
            <Form
              name="basic"
              form={form}
              initialValues={{ remember: true }}
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
            >
              <Form.Item
                // label="Username"
                name="username"
                rules={
                  isIndividual
                    ? [
                        {
                          pattern: /^1[3-9]\d{9}$/,
                          message: "无效的手机号码",
                        },
                        { required: true, message: "请输入手机号码" },
                      ]
                    : [
                        {
                          validator: async (_, value) => {
                            console.log(value);
                            if (/^1[3-9]\d{9}$/.test(value)) {
                              return Promise.reject(
                                new Error("暂不支持手机号登陆，请输入账号名"),
                              );
                            }
                          },
                        },
                        { required: true, message: "请输入账号名" },
                      ]
                }
              >
                <Input
                  size="large"
                  prefix={
                    <Iconfont
                      type={
                        isIndividual ? "icon-shoujihaoma" : "icon-qiyezhanghao"
                      }
                    />
                  }
                  placeholder={
                    isIndividual
                      ? "请输入手机号"
                      : "请输入账号名,例如abc@glodon"
                  }
                />
              </Form.Item>

              <Form.Item
                // label="Password"
                name="password"
                rules={[{ required: true, message: "请输入登录密码" }]}
              >
                <Input.Password
                  prefix={<Iconfont type="icon-mima" />}
                  size="large"
                  placeholder="请输入登录密码"
                />
              </Form.Item>

              <div className="forget-pwd">
                <a
                  href={
                    ENV === "production"
                      ? "https://account.glodon.com/forgetInit"
                      : "https://account-test.glodon.com/forgetInit"
                  }
                  target="_blank"
                  rel="noreferrer"
                >
                  忘记密码
                </a>
              </div>

              <Form.Item>
                <Button type="primary" htmlType="submit">
                  登录
                </Button>
              </Form.Item>
            </Form>
            {/* <Button style={{ marginTop: 15 }} onClick={()=> alert("功能维护中，请稍后。。。")}>申请试用资格</Button> */}
            <Link to="/apply">
              <Button style={{ marginTop: 15 }}>
                申请试用资格<span>（名额有限）</span>
              </Button>
            </Link>
          </div>
        </div>
        <div className="footer">
          <div className="offical-site">
            <div className="copyright">
              <Space split={<Divider type="vertical" />}>
                <a href={NESTBIM_BASE_URL} target="_blank" rel="noreferrer">
                  广联达设计官网
                </a>
                <Link
                  to={`${isIndividual ? "/enterprise" : "/"}${
                    window.location.search
                  }`}
                >
                  切换为{path !== "/" ? "个人版" : "企业版"}
                </Link>
              </Space>
            </div>
          </div>
          <div className="copyright">
            <a
              href="https://beian.miit.gov.cn"
              target="_blank"
              rel="noreferrer"
            >
              京ICP备10021606号-1
            </a>
            广联达科技股份有限公司 旗下产品
          </div>
        </div>
        {isIndividual && (
          <img
            className="login-bg"
            src={`${PUBLIC_URL}/loginBG@2x.png`}
            alt="loginBG@2x"
          />
        )}
      </div>
    </div>
  );
}
