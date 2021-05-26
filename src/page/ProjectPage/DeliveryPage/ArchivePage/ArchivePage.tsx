import React, { useEffect } from "react";
import { Switch, Route, useRouteMatch } from "react-router";
import { ProjectParams } from "model/route-params.model";
import { Link } from "react-router-dom";
import { Button, Checkbox, Select, Tree, message, Modal } from "antd";
import { useImmer } from "use-immer";
import ArchiveListPage from "./ArchiveListPage";
import ArchiveCreatePage from "./ArchiveCreatePage";
import ArchiveInfoPage from "./ArchiveInfoPage";
import ArchiveEditPage from "./ArchiveEditPage";

interface ArchivePageProps {}

interface State {
  editMode: boolean;
}

export default function ArchivePage(props: ArchivePageProps) {
  const {} = props;
  const [{ editMode }, updateState] = useImmer<State>({ editMode: false });
  const {
    url,
    path,
    params: { projectId },
  } = useRouteMatch<ProjectParams>();

  useEffect(() => {}, []);

  return (
    <div className="archive-page">
      <Switch>
        <Route exact path={`${path}`} component={ArchiveListPage} />
        <Route exact path={`${path}/create`} component={ArchiveCreatePage} />
        <Route
          exact
          path={`${path}/:archiveId/info`}
          component={ArchiveInfoPage}
        />
        <Route
          exact
          path={`${path}/:archiveId/edit`}
          component={ArchiveEditPage}
        />
      </Switch>
    </div>
  );
}
