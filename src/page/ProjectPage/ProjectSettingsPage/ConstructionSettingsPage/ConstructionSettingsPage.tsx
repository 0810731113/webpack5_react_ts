import React, { useEffect, useState, useCallback } from "react";
import { Switch, Route, useRouteMatch } from "react-router";
import { ProjectParams } from "model/route-params.model";
import { Link } from "react-router-dom";
import { useImmer } from "use-immer";
import { Button } from "component/Antd";
import { constructionSettingsService, messageService } from "service";
import "./ConstructionSettingsPage.scss";
import { Checkbox, message } from "antd";
import useLoading from "hook/use-loading.hook";
import Loading from "component/Loading";
import useNavMenu from "hook/use-nav-menu.hook";
import { NAV } from "consts";

interface ConstructionSettingsPageProps {}

interface State {}

export default function ConstructionSettingsPage(
  props: ConstructionSettingsPageProps,
) {
  const {} = props;

  const [startTag, setStartTag] = useState(true);
  const [endTag, setEndTag] = useState(true);

  // const [{}, updateState] = useImmer<State>({});
  const {
    url,
    path,
    params: { projectId },
  } = useRouteMatch<ProjectParams>();

  const loader = useCallback(
    () =>
      constructionSettingsService.getConfig(projectId).then((data) => {
        console.log(data);
        setStartTag(data.levelConfig.startTag);
        setEndTag(data.levelConfig.endTag);
      }),
    [],
  );
  const { loading, data } = useLoading(loader, undefined, null);

  useNavMenu(NAV.settingsJianZhu);

  const applyConfig = async () => {
    await constructionSettingsService.saveConfig(startTag, endTag, projectId);
    message.success("应用成功");

    await messageService.doPublish(projectId);
  };

  if (loading) {
    return <Loading />;
  } 
    return (
      <div className="construction-page">
        <div className="body">
          <div className="detail">
            <div style={{ marginBottom: 20 }}>
              <Button type="primary" onClick={applyConfig}>
                应用
              </Button>
            </div>

            <div>
              <span style={{ paddingRight: 5 }}>立面标高显示：</span>

              <Checkbox
                checked={startTag}
                onChange={(e) => setStartTag(e.target.checked)}
              >
                显示端头1
              </Checkbox>

              <Checkbox
                checked={endTag}
                onChange={(e) => setEndTag(e.target.checked)}
              >
                显示端头2
              </Checkbox>
            </div>
          </div>
        </div>
      </div>
    );
  
}
