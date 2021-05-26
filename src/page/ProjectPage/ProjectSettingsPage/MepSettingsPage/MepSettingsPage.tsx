import React, { useEffect } from "react";
import { Switch, Route, useRouteMatch } from "react-router";
import { ProjectParams } from "model/route-params.model";
import { useImmer } from "use-immer";

import { useRecoilValue } from "recoil";
import projectPageState from "state/project.state";
import { authService, projectService } from "service";
import useNavMenu from "hook/use-nav-menu.hook";
import consts, { NAV } from "consts";

const { GMEP_URL } = consts;

interface MepSettingsPageProps {}

interface State {}

export default function MepSettingsPage(props: MepSettingsPageProps) {
  const {} = props;
  const [{}, updateState] = useImmer<State>({});
  const { project } = useRecoilValue(projectPageState);
  const {
    url,
    path,
    params: { projectId },
  } = useRouteMatch<ProjectParams>();

  useNavMenu(NAV.settingsJiDian);

  const getUrl = () => {
    const id = projectId;
    const name = project?.name;
    const uid = authService.getUserId();
    const token = authService.getToken();
    // let orgin = "https://mep-qa.glodon.com/projectSetting_qa/#/pipeSystem";
    const origin = GMEP_URL;
    return encodeURI(`${origin}?id=${id}&uid=${uid}&token=${token}`);
  };

  useEffect(() => {
    // 临时方案，看项目是否删除
    projectService.getProjectInfoV2(projectId);
  }, []);

  return (
    <iframe
      title="mepSettings"
      scrolling="no"
      src={getUrl()}
      style={{ height: "100%", border: "none" }}
    />
  );
}
