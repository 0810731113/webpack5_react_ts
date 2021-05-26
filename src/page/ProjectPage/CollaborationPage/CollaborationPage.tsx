import React, { useEffect } from "react";
import CollaborationHeader from "./CollaborationHeader";
import "./CollaborationPage.scss";
import {
  Route,
  Switch,
  useRouteMatch,
  RouteComponentProps,
  useHistory,
} from "react-router";
import { ProjectTeamParams } from "model/route-params.model";
import PackagesPage from "./Packages/PackagesPage";
import PackageModal from "./Packages/PackageModal";
import PackageDetailPage from "./Packages/PackageDetailPage";
import OverviewPage from "./OverviewPage";
import WorkUnitPage from "./WorkUnitPage";
import IssuePage from "./IssuePage";
import useBreadCrumbs from "hook/use-breadcrumb.hook";
import {
  useQueryParams,
  StringParam,
  withDefault,
  QueryParamConfig,
} from "use-query-params";
import FilesPage from "./FilesPage/FilesPage";
import useNavMenu from "hook/use-nav-menu.hook";
import { NAV } from "consts";
import NoTeamPage from "./NoTeamPage";
import { useRecoilState } from "recoil";
import projectPageState from "state/project.state";

interface CollaborationPageProps extends RouteComponentProps {}

export const titles: { [key: string]: string } = {
  sharedPackages: "提资记录",
  receivedPackages: "收资记录",
  workunits: "工作单元",
  overview: "工作台",
};

export const FromParam: QueryParamConfig<
  "sharedPackages" | "receivedPackages" | "workunits" | "overview" | undefined
> = {
  encode: (
    value:
      | "sharedPackages"
      | "receivedPackages"
      | "workunits"
      | "overview"
      | undefined,
  ) => value,
  /** Convert the query param string value to its native type */
  decode: (value: string | (string | null)[] | null | undefined) => {
    switch (value) {
      case "sharedPackages":
      case "receivedPackages":
      case "workunits":
      case "overview":
        return value;
      default:
        return undefined;
    }
  },
};

export default function CollaborationPage(props: CollaborationPageProps) {
  const {} = props;
  const {
    path,
    url,
    params: { teamId },
  } = useRouteMatch<ProjectTeamParams>();
  const { breadCrumbs } = useBreadCrumbs(
    "团队协同",
    "collaboration",
    `${url}/overview/workunits`,
    0,
  );
  const [{ myTeams }] = useRecoilState(projectPageState);
  const history = useHistory();
  useNavMenu(NAV.collaborationSection);
  const [{ showPackageModal, from }, setQuery] = useQueryParams({
    showPackageModal: withDefault(StringParam, undefined),
    from: FromParam,
  });
  useEffect(() => {
    if (myTeams && myTeams.length === 0) {
      history.replace(`${url}/no-team`);
    }
  }, [myTeams]);

  return (
    <div className="collaboration-page">
      {/* <CollaborationHeader /> */}
      <Switch>
        <Route path={`${path}/packages`} component={PackagesPage} />
        {/* <Route
          exact
          path={`${path}/packages/:packageId`}
          component={PackageDetailPage}
        /> */}
        <Route path={`${path}/overview`} component={OverviewPage} />
        {/* <Route exact path={`${path}/workunits`} component={WorkUnitPage} /> */}
        <Route exact path={`${path}/issues`} component={IssuePage} />
        <Route exact path={`${path}/no-team`} component={NoTeamPage} />
        {/* <Route path={`${path}/files`} component={FilesPage} /> */}
      </Switch>
      <PackageModal
        onCommit={(id) => {
          history.push(
            `${url}/packages/${id}?from=${showPackageModal}&isEditContents=1`,
          );
        }}
        onClose={() => {
          setQuery({ showPackageModal: "" });
        }}
        shareId={teamId}
        showPackageModal={!!showPackageModal}
      />
      {/*     <Route
                exact
                path={`${match.path}/workunits`}
                component={WorkUnit}
            />
            <Route
                exact
                path={`${match.path}/receivedPackages`}
                component={AcceptPackage}
            />
            <Route
                exact
                path={`${match.path}/sharedPackages`}
                component={SharePackage}
            />
            <Route
                exact
                path={`${match.path}/issueManage`}
                component={IssueManage}
            />
            <Route
                exact
                path={`${match.path}/detail/:id`}
                component={InformationDetail}
            />
        </Switch>
      */}
    </div>
  );
}
