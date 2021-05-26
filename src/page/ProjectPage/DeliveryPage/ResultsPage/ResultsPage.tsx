import React, { useEffect } from "react";
import { Switch, Route, useRouteMatch } from "react-router";
import { ProjectParams } from "model/route-params.model";
import { Link } from "react-router-dom";
import { Button, Checkbox, Select, Tree, message, Modal } from "antd";
import { useImmer } from "use-immer";
// import "./ResultsPage.scss";

import ResultsCreatePage from "./ResultsCreatePage";
import ResultsListPage from "./ResultsListPage";

interface ResultsPageProps {}

interface State {
  editMode: boolean;
}

export default function ResultsPage(props: ResultsPageProps) {
  const {} = props;
  const [{ editMode }, updateState] = useImmer<State>({ editMode: false });
  const {
    url,
    path,
    params: { projectId },
  } = useRouteMatch<ProjectParams>();

  useEffect(() => {}, []);

  return (
    <div className="results-page">
      <Switch>
        <Route exact path={`${path}`} component={ResultsListPage} />
        <Route exact path={`${path}/create`} component={ResultsCreatePage} />
      </Switch>
    </div>
  );
}
