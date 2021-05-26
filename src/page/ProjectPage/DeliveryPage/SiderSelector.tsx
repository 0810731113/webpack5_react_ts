import React, { useEffect } from "react";
import { Switch, Route, useRouteMatch } from "react-router";
import { ProjectParams } from "model/route-params.model";
import { Link } from "react-router-dom";
import { useImmer } from "use-immer";
import { Button, message, Divider, Space } from "antd";

interface SiderSelectorProps {
  InfoComp: React.ReactNode;
  UnitComp: React.ReactNode;
}

interface State {
  section: "info" | "workunit";
}

export default function SiderSelector(props: SiderSelectorProps) {
  const { InfoComp, UnitComp } = props;
  const [{ section }, updateState] = useImmer<State>({ section: "info" });
  const {
    url,
    path,
    params: { projectId },
  } = useRouteMatch<ProjectParams>();

  useEffect(() => {}, []);

  return (
    <div className="main">
      <Space size="middle" direction="vertical" className="sider">
        <div
          className={`label ${section === "info" ? "selected" : ""}`}
          onClick={() => updateState((draft) => void (draft.section = "info"))}
        >
          描述
        </div>
        <div
          className={`label ${section === "workunit" ? "selected" : ""}`}
          onClick={() =>
            updateState((draft) => void (draft.section = "workunit"))
          }
        >
          交付单元
        </div>
      </Space>
      <div className="body">
        {section === "info" && <div style={{ marginTop: 12 }}>{InfoComp}</div>}

        {section === "workunit" && UnitComp}
      </div>
    </div>
  );
}
