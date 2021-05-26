import React from "react";
import pretty from "pretty";
import { act } from "react-dom/test-utils";
import { render as renderHtml, unmountComponentAtNode } from "react-dom";
import { RecoilRoot } from "recoil";

import BimfaceViewer from "../BimfaceViewer";

let container: HTMLDivElement | null;

function loadJS(url: string, callback: () => void) {
  const script = document.createElement("script");

  const fn = callback || function () {};

  script.type = "text/javascript";

  script.onload = function () {
    fn();
  };

  script.src = url;

  document.getElementsByTagName("head")[0].appendChild(script);
}

beforeEach(() => {
  loadJS(
    "https://static.bimface.com/api/BimfaceSDKLoader/BimfaceSDKLoader@latest-release.js",
    () => {},
  );
});
container = document.createElement("div");
document.body.appendChild(container);

afterEach(() => {
  if (container) {
    unmountComponentAtNode(container);
    container.remove();
    container = null;
  }
});

jest.mock("react-router-dom", () => ({
  useHistory: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

test("test bimface viewer", () => {
  act(() => {
    setTimeout(() => {
      renderHtml(
        <RecoilRoot>
          <BimfaceViewer
            cameraAnimation
            viewTokens={["ed556df8ba124cd3bba953b5bd2f98b3"]}
            modelFormat="committedWorkunit"
          />
        </RecoilRoot>,
        container,
      );
    }, 2000);
  });

  expect(pretty(container?.innerHTML)).toMatchSnapshot();
});
