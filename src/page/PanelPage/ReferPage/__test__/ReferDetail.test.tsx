import React, { ReactText } from "react";
import pretty from "pretty";
import { render, screen } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { render as renderHtml, unmountComponentAtNode } from "react-dom";

import PanelPageContext from "page/PanelPage/PanelPageContext";
import ReferDetail from "../ReferDetail";

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

jest.mock("service");
jest.mock("consts", () => ({
  isPanel: true,
  PUBLIC_URL: "/web",
}));

test("test refer detail", async () => {
  const defaultContext = {
    specialties: [
      {
        id: "294e35e2-ab8e-4a35-92d9-d20f027972df",
        name: "结构",
        projectId: "3ff55baf-f4ad-4652-b642-cce9f77f9e2c",
        description: null,
        type: "GST",
      },
      {
        id: "44d03d60-29bf-45f0-b1f2-b54698d37d0c",
        name: "建筑",
        projectId: "3ff55baf-f4ad-4652-b642-cce9f77f9e2c",
        description: null,
        type: "GAP",
      },
      {
        id: "a1c1a1a9-276e-43bb-b93a-6c487d45dd3b",
        name: "机电",
        projectId: "3ff55baf-f4ad-4652-b642-cce9f77f9e2c",
        description: null,
        type: "GMEP",
      },
    ],
  };
  await act(async () =>
    renderHtml(
      <div>
        <PanelPageContext.Provider value={defaultContext as any}>
          <ReferDetail
            onCommit={(checkedKeys: ReactText[]) => {}}
            visible
            dataSet={{
              id: "45312abb-424b-4f47-9b40-52e01a2ed9dd",
              name: "GMEP",
              folderId: "b4b53e1e-990d-4030-83de-5c4eddce9845",
              type: "committedWorkunit",
              nameSpace: undefined,
              schemaDefinition: undefined,
              specialtyId: "a1c1a1a9-276e-43bb-b93a-6c487d45dd3b",
              ownerId: undefined,
              description: "",
              tipVersion: 1,
              teamId: "3917d4af-2c29-491c-8c42-9a3961b2d94e",
              codeVersion: 1,
              projectId: undefined,
              team: {
                id: "3917d4af-2c29-491c-8c42-9a3961b2d94e",
                projectId: "3ff55baf-f4ad-4652-b642-cce9f77f9e2c",
                linkedFolderId: "b4b53e1e-990d-4030-83de-5c4eddce9845",
                name: "GAP",
                description: undefined,
                creationTime: "2021-01-06T05:14:31.000+0000",
                ownerId: "6742378634747412834",
              },
            }}
            version={{
              id: 39864,
              dataSetId: "45312abb-424b-4f47-9b40-52e01a2ed9dd",
              dataSetSourceFile: "",
              status: "Published",
              metaInfo: "{}",
              creationTime: "2021-02-01T11:40:29.000+0000",
              version: 1,
              suiteCount: 0,
              xtoken: "20bd6c70-5215-4109-b007-0f43d3a54084",
              verifyStatus: "Unverified",
            }}
          />
        </PanelPageContext.Provider>
      </div>,
      container,
    ),
  );

  expect(pretty(container?.innerHTML || "")).toMatchSnapshot();
});
