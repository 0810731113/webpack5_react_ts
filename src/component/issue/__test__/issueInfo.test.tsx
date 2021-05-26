import React from "react";
import pretty from "pretty";
import { render, screen } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { render as renderHtml, unmountComponentAtNode } from "react-dom";

import IssueInfo from "../IssueInfo";

let container: HTMLDivElement | null;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
});

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

test("test issue info", () => {
  const issue = {
    id: 1725,
    title: "Fixbug/zhangm ae",
    description: undefined,
    memo: undefined,
    file:
      "https://gdc-te-public.obs.cn-north-4.myhuaweicloud.com:443/ce57677c-fffe-4843-8ca2-45cad4987c05",
    type: "团队问题",
    userId: "6742696179203941218",
    userName: "GDC21@GDCP",
    teamId: "a5d192d7-1a36-49c3-98e4-bf9835f892c3",
    teamName: "团队B",
    elementId: "2305872421149737970",
    elementName: "墙实例 [737970]",
    markCoordinate: `{"x":-3336.699993197364,"y":-1462.9634551545546,"z":1162.33513167562}`,
    issueDatasets: [
      {
        id: 1767,
        issueId: 1725,
        versionId: 38748,
        datasetId: "bf4639dd-ebc2-4718-90a6-2e2c14ab221c",
        datasetName: "ds0017777",
        teamId: "a5d192d7-1a36-49c3-98e4-bf9835f892c3",
        teamName: "团队B",
        version: 1,
        isCurrent: 1,
      },
    ],
    camera: `{"appKey":"BIM-MODEL","schemaKey":"CameraInfo","schemaVersion":1,"data":"{"cameraVersion":0,"name":"persp","fov":45,"zoom":1,"version":1,"coordinateSystem":"world","position":{"x":-12456.640180778193,"y":-7128.100346033577,"z":14663.356439086934},"target":{"x":-6060.033331145291,"y":-731.4928152042385,"z":1500.0019379108144},"up":{"x":0.5827608107570202,"y":0.5827607956395995,"z":0.5663741629976791}}"}`,
    status: "解决中",
    closeUserId: undefined,
    closeVersion: -1,
    closeUserName: undefined,
    sequenceNo: 1,
    extraKey: undefined,
    extraData: undefined,
    creationTime: "2021-02-02T08:48:40.000+0000",
    updateTime: undefined,
  };
  act(() => {
    renderHtml(
      <div>
        <IssueInfo issue={issue} />
        <IssueInfo issue={issue} isPanel />
        <IssueInfo issue={issue} hideRemark />
        <IssueInfo issue={issue} hideRemark isPanel />
      </div>,
      container,
    );
  });

  expect(pretty(container?.innerHTML)).toMatchSnapshot();
});
