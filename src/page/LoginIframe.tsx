import React from "react";
import { useImmer } from "use-immer";
import consts from "consts";
import { Modal, Button, Form, Input, message, Empty } from "antd";
import { authService, loginService } from "service";
import { useHistory, Link } from "react-router-dom";
import "./LoginPage.scss";
import { setCookie } from "function/cookie.func";

const { PUBLIC_URL, ENV, NESTBIM_BASE_URL } = consts;

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const software = urlParams.get("software");

export interface LoginIframeProps {}

export interface State {}

export default function LoginIframe(props: LoginIframeProps) {
  const {} = props;
  const [{}, updateState] = useImmer<State>({});

  const { replace } = useHistory();

  const onFinish = (values: any) => {
    loginService
      .login(values.username, values.password)
      .then((res) => {
        const response = res.data.data;
        if (ENV === "local") {
          setCookie("accessToken", response?.oAuth2AccessToken?.access_token);
          setCookie("userId", response?.userInfo?.id);
        }
        replace(`/download?software=${software}`);
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
    <div
      className="login-page"
      style={{ background: "#f9f9f9", justifyContent: "center" }}
    >
      <div className="frame">
        <div className="form">
          <div className="tab-content">
            <div style={{ width: "100%", textAlign: "center" }}>
              <img src={`${PUBLIC_URL}/bg_logo.png`} style={{ height: 54 }} />
            </div>
            <Form
              name="basic"
              initialValues={{ remember: true }}
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
            >
              <Form.Item
                // label="Username"
                name="username"
                rules={[{ required: true, message: "请输入账号名" }]}
              >
                <Input size="large" placeholder="请输入账号名" />
              </Form.Item>

              <Form.Item
                // label="Password"
                name="password"
                rules={[{ required: true, message: "请输入登录密码" }]}
              >
                <Input.Password size="large" placeholder="请输入登录密码" />
              </Form.Item>

              <div className="forget-pwd">
                <a
                  href="https://account.glodon.com/forgetInit"
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
              <a href={NESTBIM_BASE_URL} target="_blank" rel="noreferrer">
                广联达设计官网
              </a>
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
      </div>
    </div>
  );
}
