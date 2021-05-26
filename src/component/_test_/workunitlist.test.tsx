import React, { PropsWithChildren } from "react";
import pretty from "pretty";
import { render, screen } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { render as renderHtml, unmountComponentAtNode } from "react-dom";
import WorkUnitList from "component/WorkUnitList";
import { RecoilRoot, useRecoilState, atom } from "recoil";
import projectPageState, { ProjectPageState } from "state/project.state";

interface LinkProps {
  to: string;
}

let container: HTMLDivElement;

const defaultState = {
  projectId: "",
  project: null,
  folders: [],
  teams: [
    {
      creationTime: "2020-12-16T06:51:05.000+0000",
      id: "f058f8e7-b946-4e3f-8a8a-956146f881b8",
      name: "机电团队",
      ownerId: "6742328225488007946",
      projectId: "fad4e43c-409f-4c0d-aaa9-ad4366a078d8",
    },
    {
      creationTime: "2020-12-16T06:50:05.000+0000",
      id: "6d52f9de-2c67-476c-94f3-c143b83d6ccf",
      name: "结构团队",
      ownerId: "6742328225488007946",
      projectId: "fad4e43c-409f-4c0d-aaa9-ad4366a078d8",
    },
    {
      creationTime: "2020-12-16T06:49:55.000+0000",
      id: "c98c4230-f2c9-4af6-9e5e-7abcd2c39141",
      name: "建筑团队",
      ownerId: "6742328225488007946",
      projectId: "fad4e43c-409f-4c0d-aaa9-ad4366a078d8",
    },
  ],
  myTeams: null,
  specialties: [],
  users: [],
  currentUser: {
    userName: "诸大大的工作室",
    name: "诸大大的工作室",
    id: "6742328225488007946",
  },
  templates: [],
  roles: [],
  resources: [],
};

const defaultWorkUnits = [
  {
    codeVersion: 1,
    description: "",
    folderId: "621dcfcd-a1f6-46a1-86ed-fae542222e54",
    id: "ead9c128-88d5-4c39-8758-41f4bdf25304",
    name: "结构B1",
    nameSpace: "",
    ownerId: "6742328225488007946",
    projectId: "",
    schemaDefinition: "",
    specialtyId: "e5c0b871-ed78-4d92-a167-2c7a5291a4ed",
    teamId: "6d52f9de-2c67-476c-94f3-c143b83d6ccf",
    tipVersion: 1,
    type: "workunit",
  },
  {
    codeVersion: 1,
    description: "",
    folderId: "120b1909-ca63-424f-99da-f375a6df8172",
    id: "88a5d06f-5a17-424b-939b-b78193e1f96f",
    name: "建筑1F-3F",
    nameSpace: "",
    ownerId: "6742328225488007946",
    projectId: "",
    schemaDefinition: "",
    specialtyId: "5201549b-6938-43c0-81ff-2705f2871dd5",
    teamId: "c98c4230-f2c9-4af6-9e5e-7abcd2c39141",
    tipVersion: 1,
    type: "workunit",
  },
  {
    codeVersion: 1,
    description: "",
    folderId: "120b1909-ca63-424f-99da-f375a6df8172",
    id: "56762d54-cea4-4adb-ae18-16aa2d22c270",
    name: "建筑B1",
    nameSpace: "",
    ownerId: "6742328225488007946",
    projectId: "",
    schemaDefinition: "",
    specialtyId: "5201549b-6938-43c0-81ff-2705f2871dd5",
    teamId: "c98c4230-f2c9-4af6-9e5e-7abcd2c39141",
    tipVersion: 2,
    type: "workunit",
  },
];

const defaultVersions = {
  "88a5d06f-5a17-424b-939b-b78193e1f96f": [
    {
      creationTime: "2020-12-17T02:24:51.000+0000",
      dataSetId: "88a5d06f-5a17-424b-939b-b78193e1f96f",
      dataSetSourceFile: "",
      displayVersion: "6c71cf247a915acdbf1dfba07f488255",
      id: 398807,
      metaInfo: `{"SpaceConfigVersion":"1"}`,
      status: "Published",
      suiteCount: 36,
      verify:
        "qa/6743421883042309104/Local/Glodon/GAP/dbCache/0.9.0/fileCache/c8e0a97e4b71115e3bcdc0bb9ca03f7e/1608171880524.0/fileCache/c8e0a97e4b71115e3bcdc0bb9ca03f7e",
      verifyStatus: "Legal",
      version: 1,
      viewingInfo: `{"jobToken":"7d3aea57-501c-4f0a-9e8c-f7669079d60b","fileId":2018657767680000,"status":"success"}`,
      xtoken: "11cdd75e-2115-4929-8292-2a681f4664e6",
    },
    {
      creationTime: "2020-12-16T06:56:28.000+0000",
      dataSetId: "88a5d06f-5a17-424b-939b-b78193e1f96f",
      dataSetSourceFile: "",
      displayVersion: "6373bafb5555d245c6981bf8f3fe0635",
      id: 392947,
      status: "WIP",
      suiteCount: 0,
      verifyStatus: "Unverified",
      version: 0,
    },
  ],
  "56762d54-cea4-4adb-ae18-16aa2d22c270": [
    {
      creationTime: "2020-12-17T02:20:18.000+0000",
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
      viewingInfo: `{"jobToken":"cef1ea67-9f29-4c9d-954f-7f970680f924","fileId":2018656009529344,"status":"success"}`,
      xtoken: "e3a99849-fcf2-4aed-b71d-ec01ccd1066b",
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
  ],
  "ead9c128-88d5-4c39-8758-41f4bdf25304": [
    {
      creationTime: "2020-12-17T02:41:56.000+0000",
      dataSetId: "ead9c128-88d5-4c39-8758-41f4bdf25304",
      dataSetSourceFile: "",
      displayVersion: "7d8f1fefd61ff0a2a55ab1e51add55a4",
      id: 398865,
      metaInfo: `{"SpaceConfigVersion":"1"}`,
      status: "Published",
      suiteCount: 14,
      verify:
        "qa/6744523148526576260/Local/Glodon/GST/dbCache/0.9.0/fileCache/28b7c6c0599489e558a09fc112ec3c37/1608172889700.0/fileCache/28b7c6c0599489e558a09fc112ec3c37",
      verifyStatus: "Legal",
      version: 1,
      viewingInfo: `{"jobToken":"82e32075-2e4a-4430-b33d-4fea92a8c193","fileId":2018666301253632,"status":"success"}`,
      xtoken: "30995277-aa8d-45ca-8b43-22fd528b5b89",
    },
    {
      creationTime: "2020-12-16T06:56:38.000+0000",
      dataSetId: "ead9c128-88d5-4c39-8758-41f4bdf25304",
      dataSetSourceFile: "",
      displayVersion: "7485b9b9dbdc71bb43cc5df5622c3561",
      id: 392948,
      status: "WIP",
      suiteCount: 0,
      verifyStatus: "Unverified",
      version: 0,
    },
  ],
};

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
  Link: (props: PropsWithChildren<LinkProps>) => (
    <a href={props.to}>{props.children}</a>
  ),
  useHistory: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

test("test draft workunit list", () => {
  act(() => {
    renderHtml(
      <RecoilRoot
        initializeState={(snap) => snap.set(projectPageState, defaultState)}
      >
        <WorkUnitList
          workUnits={defaultWorkUnits}
          versions={defaultVersions}
          onReload={() => null}
          mode="draft"
        />
      </RecoilRoot>,
      container,
    );
  });

  expect(pretty(container?.innerHTML)).toMatchSnapshot();
});

test("test integrate workunit list", () => {
  let ids: number[] = [];
  act(() => {
    renderHtml(
      <RecoilRoot
        initializeState={(snap) => snap.set(projectPageState, defaultState)}
      >
        <WorkUnitList
          workUnits={defaultWorkUnits}
          versions={defaultVersions}
          onReload={() => null}
          mode="integrate"
          disableToolbar
          setCheckedVersionIds={(versionIds) => {
            ids = versionIds;
          }}
        />
      </RecoilRoot>,
      container,
    );
  });

  const select1 = document.getElementsByClassName("ant-checkbox-input")[1];
  const select2 = document.getElementsByClassName("ant-checkbox-input")[2];

  act(() => {
    select1.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });

  expect(ids).toEqual([398865]);

  act(() => {
    select2.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
  expect(ids).toEqual([398865, 398807]);

  expect(pretty(container?.innerHTML)).toMatchSnapshot();
});
