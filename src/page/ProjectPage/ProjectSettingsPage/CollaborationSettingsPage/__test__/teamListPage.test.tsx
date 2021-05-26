import React, { PropsWithChildren } from "react";
import pretty from "pretty";
import { render, screen } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { render as renderHtml, unmountComponentAtNode } from "react-dom";
import { RecoilRoot, useRecoilState, atom } from "recoil";
import projectPageState from "state/project.state";
import { teamService } from "service";

import TeamListPage from "../TeamListPage";

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

jest.mock("react-router", () => ({
  useRouteMatch: () => ({
    url: "/",
    params: { projectId: "xxx" },
  }),
}));

jest.mock("react-router-dom", () => ({
  Link: (props: PropsWithChildren<{ to: string }>) => (
    <a href={props.to}>{props.children}</a>
  ),
  useHistory: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

jest.mock("service");

test("test team list page", async () => {
  renderHtml(
    <RecoilRoot
      initializeState={(snap) => snap.set(projectPageState, defaultState)}
    >
      <TeamListPage />
    </RecoilRoot>,
    container,
  );

  await act(async () => {
    await (teamService.getUsersInTeams);
  });

  expect(pretty(container?.innerHTML)).toMatchSnapshot();
});
