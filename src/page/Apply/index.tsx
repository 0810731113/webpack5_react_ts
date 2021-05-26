import React, { FC, useEffect } from "react";
import { Breadcrumb, Card, Space } from "antd";
import { BrowserRouter, Route, Switch, useRouteMatch } from "react-router-dom";
import { ProjectParams } from "model/route-params.model";
import { useImmer } from "use-immer";
import SystemHeader from "page/ProjectPage/ProjectPageComponents/SystemHeader";
import { MobileBindAccount } from "api-auth/generated/model";
import "./ApplyPage.scss";
import { ArrowRightOutlined } from "@ant-design/icons";
import { publishEvent } from "function/stats.func";
import EnterPage from "./EnterPage";
import ApplyPage, { AccountInfo, ApplyPageContext } from "./ApplyPage";

interface ApplyProps {}
interface ApplyState {
  accounts: MobileBindAccount[];
  isNew: boolean;
  applyingAccount: AccountInfo;
  succeeded: boolean;
}
const Apply: FC<ApplyProps> = (prpos) => {
  const {
    path,
    url,
    params: { projectId },
  } = useRouteMatch<ProjectParams>();
  const [
    { accounts, applyingAccount, isNew, succeeded },
    updateState,
  ] = useImmer<ApplyState>({
    accounts: [],
    isNew: true,
    applyingAccount: {},
    succeeded: false,
  });
  useEffect(() => {
    document.title = "广联达数字设计申请试用资格";
    publishEvent(`visitApply`, ["基础"], { eventLevel: "P3" });
    return () => {
      document.title = "广联达协同设计平台";
    };
  }, []);

  const setAccounts = (newValue: MobileBindAccount[]) => {
    updateState((draft) => {
      draft.accounts = newValue;
    });
  };

  const setIsNew = (newValue: boolean) => {
    updateState((draft) => {
      draft.isNew = newValue;
    });
  };

  const setSucceed = () => {
    updateState((draft) => {
      draft.succeeded = true;
    });
  };
  const setApplyingAccountInfo = (
    key:
      | "identity"
      | "password"
      | "passwordMobile"
      | "passwordEmail"
      | "userName"
      | "qq"
      | "company",
    value: string,
  ) => {
    updateState((draft) => {
      draft.applyingAccount[key] = value;
    });
  };
  return (
    <ApplyPageContext.Provider
      value={{
        accounts,
        isNew,
        succeeded,
        applyingAccount,
        setAccounts,
        setIsNew,
        setSucceed,
        setApplyingAccountInfo,
      }}
    >
      <div
        className={["apply-layout-page", succeeded ? "succeeded" : ""].join(
          " ",
        )}
      >
        <SystemHeader
          title={
            <Breadcrumb separator={<ArrowRightOutlined />}>
              <Breadcrumb.Item href={path}>申请试用资格</Breadcrumb.Item>
              {(window.location.pathname.indexOf("/apply/enterprise") !== -1 ||
                window.location.pathname.indexOf("/apply/individual") !==
                  -1) && (
                <Breadcrumb.Item>{`${
                  window.location.pathname.indexOf(`${path}/individual`) !== -1
                    ? "个人"
                    : "企业"
                }账号申请`}</Breadcrumb.Item>
              )}
            </Breadcrumb>
          }
          succeeded={succeeded}
        />
        <Switch>
          <Route path={`${path}/`} exact component={EnterPage} />
          <Route path={`${path}/:applyType`} exact component={ApplyPage} />
        </Switch>
        <div className="footer">
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
    </ApplyPageContext.Provider>
  );
};

export default Apply;
