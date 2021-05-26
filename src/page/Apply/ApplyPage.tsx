import React, {
  useEffect,
  useState,
  useContext,
  createContext,
  useRef,
} from "react";
import { Switch, Route, useRouteMatch } from "react-router";
import { EnterpriseAccount, MobileBindAccount } from "api-auth/generated/model";
import {
  CheckCircleOutlined,
  ExclamationCircleFilled,
} from "@ant-design/icons";

import { Link } from "react-router-dom";
import { Steps, Button, message, Result, FormInstance, Space } from "antd";
import { useImmer } from "use-immer";
import "./ApplyPage.scss";
import consts from "consts";
import SystemHeader from "page/ProjectPage/ProjectPageComponents/SystemHeader";
import { IsPC } from "function/common.func";
import { ApplyParams } from "model/route-params.model";
import { onResponseError } from "function/auth.func";
import { applyService } from "service";
import { publishEvent } from "function/stats.func";
import VerifyTel from "./VerifyTel";
import VerifyAccount from "./VerifyAccount";
import Register from "./Register";

const { PUBLIC_URL, NESTBIM_BASE_URL } = consts;

interface ApplyPageProps {}

interface State {
  // accounts: MobileBindAccount[];
  // isNew: boolean;
  // applyingAccount: AccountInfo;
  // succeeded: boolean;
}

const { Step } = Steps;
export const ApplyPageContext = createContext<ApplyContext>({} as any);

export default function ApplyPage(props: ApplyPageProps) {
  const {} = props;
  const { succeeded, setSucceed } = useContext(ApplyPageContext);
  const registerFormRef = useRef<FormInstance>(null);
  const verifyTelFormRef = useRef<FormInstance>(null);
  const {
    params: { applyType },
  } = useRouteMatch<ApplyParams>();
  useEffect(() => {
    const changeFavicon = (link: string) => {
      let $favicon: any = document.querySelector('link[rel="shortcut icon"]');
      // If a <link rel="icon"> element already exists,
      // change its href to the given link.
      if ($favicon !== null) {
        $favicon.href = link;
        // Otherwise, create a new element and append it to <head>.
      } else {
        $favicon = document.createElement("link");
        $favicon.rel = "shortcut icon";
        $favicon.href = link;
        document.head.appendChild($favicon);
      }
    };
    changeFavicon(`${PUBLIC_URL}/design-favicon.ico`);
  }, []);
  useEffect(() => {
    publishEvent(`apply`, ["基础"], {
      eventLevel: "P1",
      accountType: applyType === "enterprise" ? "企业账号" : "个人账号",
    });
  }, []);

  const [current, setCurrent] = useState(0);

  const steps = [
    {
      title: "输入手机号码",
      description: "请输入您要绑定试用资格的手机号码",
      content: <VerifyTel onNext={() => setCurrent(1)} />,
    },
    {
      title: "账号名/密码设置",
      description: "请设置您的账号名和密码",
      content: <VerifyAccount onNext={() => setCurrent(2)} />,
    },
    {
      title: "填写申请信息",
      description: "继续广联达设计之旅",
      content: <Register />,
    },
  ];

  const individualCommit = async () => {
    const registerValues = await registerFormRef?.current?.validateFields();
    const verifyTelValues = await verifyTelFormRef?.current?.validateFields();
    try {
      const result = await applyService.reviewPersonalAccount({
        certificateUrl: registerValues.certificate,
        company: registerValues.company,
        department: registerValues.department,
        email: registerValues.passwordEmail,
        name: registerValues.userName,
        position: registerValues.position,
        qq: registerValues.qq,
        reason: registerValues.reason,
        telephone: verifyTelValues.mobile,
        verifyCode: verifyTelValues.code,
      });
      setSucceed();
    } catch (error) {
      if ([10002, 50007].includes(error.response?.data?.code)) {
        verifyTelFormRef?.current?.setFields([
          { errors: [error.response?.data?.msg], name: "code" },
        ]);
      } else {
        onResponseError(error);
      }
    }
  };
  const bannerPNG = `${
    applyType === "enterprise" ? "main_banner" : "personal_banner"
  }.png`;
  const headerStyle = {
    backgroundImage: `url("${PUBLIC_URL}/${bannerPNG}")`,
    backgroundColor: applyType === "enterprise" ? "#fff" : "#36565e",
  };
  return (
    <div className="apply-page">
      {succeeded ? (
        <>
          <div className="header" style={headerStyle}>
            <div className="slogon">
              <div className="main">一个账号，使用广联达所有产品</div>
              <div className="sub">
                AECORE 、构件坞 、BIMFACE 、广材网 、服务新干线 、协筑
                、CAD快速看图 、造价云等...
              </div>
            </div>
          </div>

          <div className="content succeeded">
            <Result
              title="提交成功"
              icon={<CheckCircleOutlined />}
              status="success"
              extra={
                <Space direction="vertical">
                  我们将尽快和您电话沟通，邮件通知您申请结果，请耐心等待
                  <a href={NESTBIM_BASE_URL}>
                    <Button
                      shape="round"
                      type="primary"
                      style={{ width: 200, fontSize: 16, marginTop: 16 }}
                      size="large"
                    >
                      返回官网
                    </Button>
                  </a>
                </Space>
              }
            />
          </div>
        </>
      ) : (
        <>
          {applyType === "enterprise" && (
            <div
              className="header"
              style={{
                backgroundImage: `url("${PUBLIC_URL}/main_banner.png")`,
              }}
            >
              <div className="steps">
                <Steps current={current}>
                  {steps.map((item) => (
                    <Step
                      key={item.title}
                      title={item.title}
                      description={
                        <span style={{ fontSize: 12 }}>{item.description}</span>
                      }
                    />
                  ))}
                </Steps>
              </div>
            </div>
          )}
          <div className="content">
            {([0, 2].includes(current) || applyType === "individual") && (
              <div className="exclamation">
                <ExclamationCircleFilled
                  style={{ color: "#faad14", marginRight: 5 }}
                />
                {applyType === "individual" || current === 0
                  ? "本产品目前处于邀请体验阶段，仅授权部分以住宅施工图设计为主要业务的建筑设计企业用户参与试用体验。感谢理解与支持！"
                  : "真实完整的申请信息有助于提高申请通过概率："}
              </div>
            )}
            {applyType === "enterprise" ? (
              steps[current].content
            ) : (
              <>
                <Register individual ref={registerFormRef} />
                <VerifyTel ref={verifyTelFormRef} />
                <Button
                  type="primary"
                  style={{ margin: "16px 0 32px" }}
                  onClick={individualCommit}
                >
                  提交申请
                </Button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export interface AccountInfo {
  identity?: string;
  password?: string;
  passwordMobile?: string;
  passwordEmail?: string;
  userName?: string;
  qq?: string;
  company?: string;
}

interface ApplyContext {
  accounts: MobileBindAccount[];
  isNew: boolean;
  succeeded: boolean;
  applyingAccount: AccountInfo | null;
  setAccounts: (accounts: MobileBindAccount[]) => void;
  setIsNew: (isNew: boolean) => void;
  setSucceed: () => void;
  setApplyingAccountInfo: (
    key:
      | "identity"
      | "password"
      | "passwordMobile"
      | "passwordEmail"
      | "userName"
      | "qq"
      | "company",
    value: string,
  ) => void;
}
