import React, { useEffect } from "react";
import { Switch, Route, useRouteMatch } from "react-router";
import { ProjectParams } from "model/route-params.model";
import { Link, useHistory } from "react-router-dom";
import { useImmer } from "use-immer";
import "./GridRoute.scss";
import { NAV } from "consts";
import useNavMenu from "hook/use-nav-menu.hook";
import { gridSettingsService } from "service";
import { useRequest } from "@umijs/hooks";
import { Button, Checkbox, Select, Tabs, message, Modal } from "antd";
import Loading from "component/Loading";
import { GridType } from "service/grid.settings.service";
import GarchPage from "./GarchPage";
import GridSettingsPage from "./GridSettingsPage";
import GridWelcome from "./GridWelcome";

interface GridRouteProps {}

interface State {
  gridType: number | null | undefined;
}

export default function GridRoute(props: GridRouteProps) {
  const {} = props;
  const [{ gridType }, updateState] = useImmer<State>({ gridType: undefined });
  const {
    url,
    path,
    isExact,
    params: { projectId },
  } = useRouteMatch<ProjectParams>();

  const history = useHistory();

  useNavMenu(NAV.settingsZhouWang);

  const loader = async () => gridSettingsService.getGridType(projectId).then((type) => {
      toUrl(type);
    });
  const { loading, data, run } = useRequest(loader, {
    manual: true,
  });

  useEffect(() => {
    run();
  }, [isExact]);

  const toUrl = (gridType: number | null) => {
    if (gridType === GridType.GDCP) {
      history.replace(`${url}/gdcp`);
    }
    if (gridType === GridType.GARCH) {
      history.replace(`${url}/garch`);
    }

    if (gridType === null) {
      history.replace(`${url}/welcome`);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <Switch>
      <Route exact path={`${path}/welcome`} component={GridWelcome} />
      <Route path={`${path}/gdcp`} component={GridSettingsPage} />
      <Route path={`${path}/garch`} component={GarchPage} />
    </Switch>
  );
}
