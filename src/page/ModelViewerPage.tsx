import { Space, Button } from "antd";
import WorkUnitModelViewer from "component/model/WorkUnitModelViewer";
import { CommaNumberArrayParam } from "function/route.func";
import { size } from "lodash";
import React from "react";
import { StringParam, useQueryParam } from "use-query-params";
import "./ModelViewerPage.scss";
import CropLayer from "component/Drawer/CropLayer";
import { useSize } from "@umijs/hooks";
import HeaderActions from "./_shared/HeaderActions";
import HeaderLogo from "./_shared/HeaderLogo";
import ProjectHeader from "./ProjectPage/ProjectPageComponents/ProjectHeader";

export interface ModelViewerPageProps {}

export interface State {}

export default function ModelViewerPage(props: ModelViewerPageProps) {
  const {} = props;
  const [versionIdList] = useQueryParam("versionIdList", CommaNumberArrayParam);
  const [format] = useQueryParam("format", StringParam);
  const [title] = useQueryParam("title", StringParam);

  if (size(versionIdList) === 0) {
    return <div>必须指定至少一个 version id</div>;
  }

  if (!format) {
    return <h1>必须指定 Format</h1>;
  }

  return (
    <div className="model-viewer-page">
      <ProjectHeader needBack={false} title={title ?? "模型查看"} />

      <main>
        <WorkUnitModelViewer
          versionIdList={versionIdList as number[]}
          format={format}
        />
      </main>
    </div>
  );
}
