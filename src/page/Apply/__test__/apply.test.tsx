import React from "react";
import pretty from "pretty";
import { render, screen } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { render as renderHtml, unmountComponentAtNode } from "react-dom";
import { MobileBindAccount } from "api-auth/generated/model";

import ApplyPage, { ApplyPageContext } from "../ApplyPage";
import VerifyTel from "../VerifyTel";
import VerifyAccount from "../VerifyAccount";

let container: HTMLDivElement;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  if (container) {
    unmountComponentAtNode(container);
    container.remove();
  }
});

jest.mock("react-router-dom", () => ({
  useHistory: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

test("test verify tel", () => {
  act(() => {
    renderHtml(<VerifyTel onNext={() => null} />, container);
  });

  expect(pretty(container?.innerHTML)).toMatchSnapshot();
});

test("test verify account", () => {
  const accounts = [
    {
      email: "",
      enterpriseUser: true,
      fullname: "SuperMAO",
      id: "6741899231286796949",
      passwordMobile: "15121143191",
      status: -1,
      username: "SuperMAO",
    },
  ];

  // render(
  //   <ApplyPageContext.Provider value={{ accounts }}>
  //     <VerifyAccount onNext={() => null} />
  //   </ApplyPageContext.Provider>,
  //   container,
  // );

  const defaultContext = {
    accounts,
    isNew: false,
    succeeded: false,
    applyingAccount: null,

    setSucceed: () => null,
    setAccounts: (newValue: MobileBindAccount[]) => null,
    setIsNew: jest.fn(),
    setApplyingAccountInfo: jest.fn(),
  };

  act(() => {
    renderHtml(
      <ApplyPageContext.Provider value={defaultContext}>
        <VerifyAccount onNext={() => null} />
      </ApplyPageContext.Provider>,
      container,
    );
  });

  expect(screen.getByTitle("SuperMAO")).toBeInTheDocument();
});
