import React from "react";
import pretty from "pretty";
import { render, screen } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { render as renderHtml, unmountComponentAtNode } from "react-dom";

import { teamService } from "service";
import PanelPageContext from "page/PanelPage/PanelPageContext";
import ReferPage from "../index";

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

test("test refer page", async () => {
  const defaultContext = {
    projectId: "3ff55baf-f4ad-4652-b642-cce9f77f9e2c",
    workUnit: {
      codeVersion: 1,
      description: "",
      folderId: "b4b53e1e-990d-4030-83de-5c4eddce9845",
      id: "b7d12fb2-a04f-41c4-9b91-df646de651b4",
      name: "B",
      nameSpace: null,
      ownerId: "6742694569103397638",
      projectId: null,
      schemaDefinition: null,
      specialtyId: "44d03d60-29bf-45f0-b1f2-b54698d37d0c",
      teamId: "3917d4af-2c29-491c-8c42-9a3961b2d94e",
      tipVersion: 4,
      type: "workunit",
    },
    referingVersionIds: ["38315"],
    refreshCount: 1,
    workunitReadonly: false,
    userId: "6742693964083531997",
    accessToken: "cn-e5a6e077-8602-4f18-ad55-276e099f88e3",
    setReferedVersions() {},
    setReferingVersionIds() {},
    setReferWorkUnits() {},
  };
  await act(async () =>
    renderHtml(
      <div>
        <PanelPageContext.Provider value={defaultContext as any}>
          <ReferPage activeKey="2" />
        </PanelPageContext.Provider>
      </div>,
      container,
    ),
  );

  expect(pretty(container?.innerHTML || "")).toMatchSnapshot();
});
