import { ProjectParams } from "model/route-params.model";
import React, { useEffect } from "react";
import { Route, Switch, useHistory, useRouteMatch } from "react-router";
import { Link } from "react-router-dom";
import { useImmer } from "use-immer";
import DraftWorkUnitListPage from "./DraftWorkUnitListPage";
import "./PersonalPage.scss";
import useNavMenu from "hook/use-nav-menu.hook";
import { NAV, defaultScrollbarSettings } from "consts";
import Scrollbars from "react-custom-scrollbars";

export interface PersonalPageProps {}

export interface State {}

export default function PersonalPage(props: PersonalPageProps) {
  const {} = props;
  const [{}, updateState] = useImmer<State>({});
  const {
    url,
    path,
    isExact,
    params: { projectId },
  } = useRouteMatch<ProjectParams>();
  const { replace } = useHistory();
  useNavMenu(NAV.personalSection);

  useEffect(() => {
    if (isExact) {
      replace(`${url}/work-units`);
    }
  }, [isExact]);

  return (
    <div className="personal-page">
      <main>
        {/* <div className="sidebar">
          <section>
            <div className="title">
              <Link to={`${url}/work-units`}>工作单元</Link>
            </div>
          </section>
        </div> */}
        <Scrollbars {...defaultScrollbarSettings}>
          <div className="body">
            <Switch>
              <Route
                path={`${path}/work-units`}
                component={DraftWorkUnitListPage}
              />
            </Switch>
          </div>
        </Scrollbars>
      </main>
    </div>
  );
}
