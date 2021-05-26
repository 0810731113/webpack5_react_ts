import React, { useEffect, useCallback } from "react";
import { Switch, Route, useRouteMatch } from "react-router";
import { ProjectParams } from "model/route-params.model";
import { Link } from "react-router-dom";
import { useImmer } from "use-immer";
import { structureService } from "service";
import useLoading from "hook/use-loading.hook";
import Loading from "component/Loading";
import { SuiteMetaBean } from "api-struc/generated/model";
import { SuiteSearchCondition } from "service/structure.service";
import SuiteList from "./SuiteList";

interface SuiteListPageProps {
  condition: SuiteSearchCondition;
  source: "project" | "common";
  setSelSuite: (suite: SuiteMetaBean) => void;
}

interface State {
  selectedSuite: SuiteMetaBean | null;
  suiteList: SuiteMetaBean[];
}

export default function SuiteListPage(props: SuiteListPageProps) {
  const { condition, source, setSelSuite } = props;
  //   const [{ selectedSuite }, updateState] = useImmer<State>({
  //     selectedSuite: null,
  //     suiteList: [],
  //   });
  const {
    url,
    path,
    params: { projectId },
  } = useRouteMatch<ProjectParams>();

  const loader = useCallback(
    () => structureService.getSuites(source, condition, projectId),
    [condition],
  );

  const { loading, data: suiteList } = useLoading(loader, undefined, []);


  if (loading) {
    return <Loading />;
  }

  return <SuiteList data={suiteList!} setSelSuite={setSelSuite} />;
}
