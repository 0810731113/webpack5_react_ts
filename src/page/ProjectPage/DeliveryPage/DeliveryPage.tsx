import React, { useEffect } from "react";
import { Switch, Route, useRouteMatch } from "react-router";
import { ProjectParams } from "model/route-params.model";
import { Link, useHistory } from "react-router-dom";
import { Button, Checkbox, Select, Tabs, message, Modal } from "antd";
import { useImmer } from "use-immer";
import { NAV } from "consts";
import "./DeliveryPage.scss";
import useNavMenu from "hook/use-nav-menu.hook";
import ResultsPage from "./ResultsPage/ResultsPage";
import ArchivePage from "./ArchivePage/ArchivePage";

interface DeliveryPageProps {}

interface State {
  activeTab: string;
}

const { TabPane } = Tabs;

export default function DeliveryPage(props: DeliveryPageProps) {
  const {} = props;
  const [{ activeTab }, updateState] = useImmer<State>({
    activeTab: "resources",
  });
  const {
    url,
    path,
    isExact,
    params: { projectId },
  } = useRouteMatch<ProjectParams>();

  useNavMenu(NAV.projectArchive);

  const { replace } = useHistory();

  useEffect(() => {
    if (isExact) {
      replace(`${url}/resources`);
    }
  }, []);

  return (
    <div className="delivery-page">
      <Tabs
        defaultActiveKey="resources"
        activeKey={activeTab}
        onChange={(activeKey) => replace(`${url}/${activeKey}`)}
      >
        <TabPane tab="资源池" key="resources" />
        <TabPane tab="交付包" key="archives" />
      </Tabs>
      <div className="content">
        <Switch>
          <Route
            path={`${path}/resources`}
            render={() => {
              updateState((draft) => {
                draft.activeTab = "resources";
              });
              return <ResultsPage />;
            }}
          />
          <Route
            path={`${path}/archives`}
            render={() => {
              updateState((draft) => {
                draft.activeTab = "archives";
              });
              return <ArchivePage />;
            }}
          />
        </Switch>
      </div>
    </div>
  );
}
