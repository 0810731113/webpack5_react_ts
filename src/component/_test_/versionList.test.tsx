import React, { PropsWithChildren } from "react";
import pretty from "pretty";
import { render, screen } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { render as renderHtml, unmountComponentAtNode } from "react-dom";
import WorkUnitList from "component/WorkUnitList";
import { SelectVersions } from "component/Version/SelectVersions";
import { VersionVO } from "api/generated/model";

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

test("test no version", () => {
  const versions: VersionVO[] = [];

  act(() => {
    renderHtml(
      <SelectVersions
        versions={versions}
        onVersionSelected={(version) => null}
      />,
      container,
    );
  });

  expect(pretty(container?.innerHTML)).toMatchSnapshot();
});

test("test zero version", () => {
  const versions = [
    {
      creationTime: "2020-12-16T06:49:55.000+0000",
      dataSetId: "56762d54-cea4-4adb-ae18-16aa2d22c270",
      dataSetSourceFile: "",
      displayVersion: "920d812931ee104164203547c0939ca9",
      id: 392838,
      status: "WIP",
      suiteCount: 0,
      verifyStatus: "Unverified",
      version: 0,
    },
  ];

  act(() => {
    renderHtml(
      <SelectVersions
        versions={versions}
        onVersionSelected={(version) => null}
      />,
      container,
    );
  });

  expect(pretty(container?.innerHTML)).toMatchSnapshot();
});

test("test selectVersions", () => {
  const versions = [
    {
      reationTime: "2020-12-17T02:20:18.000+0000",
      dataSetId: "56762d54-cea4-4adb-ae18-16aa2d22c270",
      dataSetSourceFile: "",
      displayVersion: "7205954ece8aee8085598889e61b8975",
      id: 398765,
      metaInfo: `{"SpaceConfigVersion":"1"}`,
      status: "Published",
      suiteCount: 10,
      verify:
        "qa/6743421883042309104/Local/Glodon/GAP/dbCache/0.9.0/fileCache/e25ac2c73bdcc0be61ce61cf44881c13/1608171607076.0/fileCache/e25ac2c73bdcc0be61ce61cf44881c13",
      verifyStatus: "Legal",
      version: 1,
      viewingInfo: `{"jobToken":"cef1ea67-9f29-4c9d-954f-7f970680f924","fileId":2018656009529344,"status":"success"}"`,
      xtoken: "e3a99849-fcf2-4aed-b71d-ec01ccd1066b",
    },
    {
      creationTime: "2020-12-16T06:49:55.000+0000",
      dataSetId: "56762d54-cea4-4adb-ae18-16aa2d22c270",
      dataSetSourceFile: "",
      displayVersion: "920d812931ee104164203547c0939ca9",
      id: 392838,
      status: "WIP",
      suiteCount: 0,
      verifyStatus: "Unverified",
      version: 0,
    },
    {
      creationTime: "2020-12-17T02:28:46.000+0000",
      dataSetId: "56762d54-cea4-4adb-ae18-16aa2d22c270",
      dataSetSourceFile: "",
      displayVersion: "c706f86079ea9dcec1159909b5e36cb8",
      id: 398820,
      metaInfo: `{"SpaceConfigVersion":"1"}`,
      status: "Published",
      suiteCount: 36,
      verify:
        "qa/6743421883042309104/Local/Glodon/GAP/dbCache/0.9.0/fileCache/7607a84109b583009c6557c34843a43e/1608172114694.0/fileCache/7607a84109b583009c6557c34843a43e",
      verifyStatus: "Legal",
      version: 2,
      viewingInfo: `{"jobToken":"caa0218a-23e7-486c-a426-f915762978e5","fileId":2018659697608896,"status":"success"}`,
      xtoken: "d0f79b73-2198-4115-ab5d-9521704a6ef7",
    },
  ];

  act(() => {
    renderHtml(
      <SelectVersions
        versions={versions}
        onVersionSelected={(version) => null}
      />,
      container,
    );
  });

  expect(pretty(container?.innerHTML)).toMatchSnapshot();
});
