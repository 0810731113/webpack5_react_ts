import { ProjectParams } from "model/route-params.model";
import React from "react";
import { Route, Switch, useRouteMatch } from "react-router";
import SpaceSettingsPage from "./SpaceSettingsPage/SpaceSettingsPage";
import StructurePage from "./StructurePage/StructurePage";
import CollaborationSettingsPage from "./CollaborationSettingsPage/CollaborationSettingsPage";
import ProjectInfoSettings from "./ProjectInfoSettingsPage/ProjectInfoSettingsPage";
import ConstructionSettingsPage from "./ConstructionSettingsPage/ConstructionSettingsPage";
import MepSettingsPage from "./MepSettingsPage/MepSettingsPage";
import GridRoute from "./GridSettingsPage/GridRoute";
import StyleSettingsPage from "./StyleSettingsPage/StyleSettingsPage";

export interface ProjectSettingsPageProps {}

export interface ProjectSettingsPageState {}

export default function ProjectSettingsPage(props: ProjectSettingsPageProps) {
  const {} = props;
  const {
    url,
    path,
    params: { projectId },
  } = useRouteMatch<ProjectParams>();

  return (
    <Switch>
      <Route path={`${path}/project-info`} component={ProjectInfoSettings} />
      <Route
        path={`${path}/collaboration`}
        component={CollaborationSettingsPage}
      />
      <Route path={`${path}/grid`} component={GridRoute} />
      <Route path={`${path}/space`} component={SpaceSettingsPage} />
      <Route path={`${path}/structure`} component={StructurePage} />
      <Route
        path={`${path}/construction`}
        component={ConstructionSettingsPage}
      />
      <Route path={`${path}/newgmep`} component={MepSettingsPage} />
      <Route path={`${path}/stylelib`} component={StyleSettingsPage} />
    </Switch>
  );
}
