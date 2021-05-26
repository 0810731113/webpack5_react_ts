import NotFoundPage from "page/NotFoundPage";
import PanelPage from "page/PanelPage/PanelPage";
import React from "react";
import { Route, Switch } from "react-router";
import { BrowserRouter } from "react-router-dom";
import { useImmer } from "use-immer";
import { QueryParamProvider } from "use-query-params";

export interface PanelAppProps {}

export interface State {}

export default function PanelApp(props: PanelAppProps) {
  const {} = props;
  const [{}, setState] = useImmer<State>({});

  return (
    <BrowserRouter>
      <QueryParamProvider ReactRouterRoute={Route}>
        <Switch>
          <Route path="/panel" component={PanelPage} />
          <Route path="*" component={NotFoundPage} />
        </Switch>
      </QueryParamProvider>
    </BrowserRouter>
  );
}
