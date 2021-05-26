import React, { useEffect, useCallback, useContext } from "react";
import { Switch, Route, useRouteMatch } from "react-router";
import { ProjectParams } from "model/route-params.model";
import { useImmer } from "use-immer";
import "./StyleSettingsPage.scss";

import useNavMenu from "hook/use-nav-menu.hook";
import { NAV } from "consts";

import { message, Button, Tabs } from "antd";
import FontSettingsPage from "./FontSettingsPage";

interface StyleSettingsPageProps {}

interface State {
  showEdit: boolean;
}

const { TabPane } = Tabs;

export default function StyleSettingsPage(props: StyleSettingsPageProps) {
  const {} = props;
  const [{ showEdit }, updateState] = useImmer<State>({
    showEdit: false,
  });
  const {
    url,
    path,
    params: { projectId },
  } = useRouteMatch<ProjectParams>();
  useNavMenu(NAV.settingsYangShiKu);
  
  return (
    <div className="style-library">
      <div className="body">
        <div className="detail">
          <div className="header">
            <div className="title">项目样式库</div>
            <div className="sub-title">
              项目级别的“素材库”，您可以在广联达建筑设计、结构设计、机电设计软件中共享并使用这些素材。（更多样式库正在研发中，敬请期待）
            </div>
          </div>

          <div className="content">
            <Tabs defaultActiveKey="font">
              <TabPane tab="字体" key="font">
                <FontSettingsPage />
              </TabPane>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
