import React, { PropsWithChildren } from "react";
import pretty from "pretty";
import { render, screen } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { render as renderHtml, unmountComponentAtNode } from "react-dom";
import { isPanel } from "consts";

import { ResourcePermissionResourceEnum } from "api-authorization/generated/model";
import { roleService } from "service";

import WorkUnitTree from "component/WorkUnitTree";
import PanelPageContext from "../PanelPageContext";
import SelectWorkUnitPage from "../SelectWorkUnitPage/SelectWorkUnitPage";

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
  jest.clearAllMocks();
});

jest.mock("service");
jest.mock("consts", () => ({
  isPanel: true,
  PUBLIC_URL: "/web",
}));

jest.mock("component/CheckPermission/CheckPermissionPlatform");

test("external user", async () => {
  const defaultContext = {
    userId: "6742693964083531997",
    accessToken: "cn-e5a6e077-8602-4f18-ad55-276e099f88e3",
    projectId: "3f9cbef2-e240-4797-97ab-2a29f9224f8c",
  };

  renderHtml(
    <PanelPageContext.Provider value={defaultContext as any}>
      <SelectWorkUnitPage activeKey="1" />
    </PanelPageContext.Provider>,

    container,
  );

  await act(async () => {
    await (roleService.getMyRole);
  });

  expect(pretty(container?.innerHTML)).toMatchSnapshot();
});

test("test open workunit", async () => {
  const defaultContext = {
    userId: "6742693964083531997",
    accessToken: "cn-e5a6e077-8602-4f18-ad55-276e099f88e3",
    projectId: "3f9cbef2-e240-4797-97ab-2a29f9224f8c",
    // workUnit: null,
    // workUnits: [],
    // version: null,
    // specialtyType: SpecialtyVOTypeEnum.GST,
    // referingVersionIds: [],
    // referedVersions: [],
    // referWorkUnits: [],
    // workunitReadonly: false,
    // showprocess: 0,
    // logs: [],
    // resources: [],
    // projectContent: null,
    // // setSpecialties:(x)=>void,
    // // setOpeningWorkUnit:(x)=>void,
  };

  const datasets = {
    "f84e38f9-c4f1-4263-97ca-1b8655e6b935": [
      {
        codeVersion: 1,
        description: "",
        folderId: "37e957e5-34bd-42e1-8d74-8a5ff7e2d5c0",
        id: "a0c3cb00-4656-447b-b168-b3beb8dd3cf1",
        name: "ds001",
        nameSpace: "",
        ownerId: "6742378634747412834",
        projectId: undefined,
        schemaDefinition: undefined,
        specialtyId: "9ab40471-5f4e-4d27-95d3-a4b40291eec8",
        teamId: "f84e38f9-c4f1-4263-97ca-1b8655e6b935",
        tipVersion: 4,
        type: "workunit",
      },
    ],
  };

  const versions = {
    "a0c3cb00-4656-447b-b168-b3beb8dd3cf1": [
      {
        creationTime: "2021-03-05T12:09:28.000+0000",
        dataSetId: "a0c3cb00-4656-447b-b168-b3beb8dd3cf1",
        dataSetSourceFile: "",
        id: 41973,
        metaInfo: `{"SpaceConfigVersion":"1"}`,
        status: "WIP",
        suiteCount: 3,
        verifyStatus: "Unverified",
        version: 3,
        viewingInfo: `{"jobToken":"991e63d1-28d1-4708-8d5d-af19eb702bee","fileId":2074152479410720,"status":"success"}`,
        xtoken: "eb9724c7-6fce-450e-8235-6f57a3658642",
      },
      {
        creationTime: "2021-03-05T11:15:56.000+0000",
        dataSetId: "a0c3cb00-4656-447b-b168-b3beb8dd3cf1",
        dataSetSourceFile: "",
        id: 41970,
        status: "WIP",
        suiteCount: 0,
        verifyStatus: "Unverified",
        version: 0,
      },
      {
        creationTime: "2021-03-05T11:17:01.000+0000",
        dataSetId: "a0c3cb00-4656-447b-b168-b3beb8dd3cf1",
        dataSetSourceFile: "",
        id: 41971,
        metaInfo: `{"SpaceConfigVersion":"1"}`,
        status: "WIP",
        suiteCount: 2,
        verifyStatus: "Unverified",
        version: 1,
        viewingInfo: `{"jobToken":"e1c4dc2f-d5b3-494b-94a5-4aa7aa1c3e18","fileId":2074126702414144,"status":"success"}`,
        xtoken: "e71684d0-da77-4f44-8549-9562ad0bf9a6",
      },
      {
        creationTime: "2021-03-05T11:18:01.000+0000",
        dataSetId: "a0c3cb00-4656-447b-b168-b3beb8dd3cf1",
        dataSetSourceFile: "",
        id: 41972,
        metaInfo: `{"SpaceConfigVersion":"1"}`,
        status: "WIP",
        suiteCount: 2,
        verifyStatus: "Unverified",
        version: 2,
        viewingInfo: `{"jobToken":"f188cb65-3194-438b-96af-6c364a563975","fileId":2074127184529952,"status":"success"}`,
        xtoken: "e71684d0-da77-4f44-8549-9562ad0bf9a6",
      },
    ],
  };

  renderHtml(
    <PanelPageContext.Provider value={defaultContext as any}>
      <WorkUnitTree
        disabled={false}
        teams={[
          {
            creationTime: "2021-03-05T11:15:47.000+0000",
            description: "",
            id: "f84e38f9-c4f1-4263-97ca-1b8655e6b935",
            linkedFolderId: "37e957e5-34bd-42e1-8d74-8a5ff7e2d5c0",
            name: "GAP",
            ownerId: "6742378634747412834",
            projectId: "3f9cbef2-e240-4797-97ab-2a29f9224f8c",
            status: undefined,
          },
        ]}
        datasets={datasets}
        versions={versions}
      />
    </PanelPageContext.Provider>,

    container,
  );

  expect(pretty(container?.innerHTML)).toMatchSnapshot();
});
