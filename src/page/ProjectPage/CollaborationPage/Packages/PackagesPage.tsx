import React from "react";
import { useQueryParam, StringParam } from "use-query-params";
import { Route, Switch, useRouteMatch, useLocation } from "react-router";
import { ProjectTeamParams } from "model/route-params.model";
import SharedPackagesPage from "./SharedPackagesPage";
import ReceivedPackagesPage from "./ReceivedPackagesPage";
import "./PackagesPage.scss";
import PackageDetailPage from "./PackageDetailPage";
import useBreadCrumbs from "hook/use-breadcrumb.hook";
import { BreadcrumbHeader } from "../CollaborationHeader";

interface PackagesPageProps {}

export default function PackagesPage(props: PackagesPageProps) {
  const [type] = useQueryParam("type", StringParam);
  const {
    path,
    params: { teamId },
  } = useRouteMatch<ProjectTeamParams>();
  const { pathname, search } = useLocation();
  const { breadCrumbs } = useBreadCrumbs(
    type === "shared" ? "提资记录" : type === "received" ? "收资记录" : "",
    "packages",
    `${pathname}${search}`,
    1,
  );
  return (
    <>
      <BreadcrumbHeader breadCrumbs={breadCrumbs} />
      {type === "shared" && <SharedPackagesPage />}
      {type === "received" && <ReceivedPackagesPage />}
      {!type && (
        <Switch>
          <Route
            exact
            path={`${path}/:packageId`}
            component={PackageDetailPage}
          />
        </Switch>
      )}
    </>
  );
}
