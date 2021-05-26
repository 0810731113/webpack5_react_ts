import { Button, Result } from "antd";
import React, { useEffect } from "react";
import { Link, useHistory } from "react-router-dom";
import { removeCookie } from "function/cookie.func";
import { loginService } from "service";
import { StringParam, useQueryParams, withDefault } from "use-query-params";

export interface LogoutPageProps {}

export interface State {}

export default function LogoutPage(props: LogoutPageProps) {
  const {} = props;

  const history = useHistory();
  const [{ isPersonalAccount }] = useQueryParams({
    isPersonalAccount: withDefault(StringParam, undefined),
  });

  useEffect(() => {
    // sessionStorage.removeItem("dontShowAgain");
    removeCookie("dontShowAgain");
    loginService.removeSession();
    history.replace(isPersonalAccount === "1" ? "/" : "/enterprise");
  }, [isPersonalAccount]);

  return null;
}
