import { Tag } from "antd";
import React from "react";
import { useParams } from "react-router";
import { StringParam, useQueryParams } from "use-query-params";
import TeamFileSelector from "./TeamFileSelector";

export interface PanelComponentPageProps {}

export interface State {}

export default function PanelComponentPage(props: PanelComponentPageProps) {
  const {} = props;
  const { type } = useParams<{ type: string }>();
  const [{ projectId }, setParams] = useQueryParams({
    projectId: StringParam,
  });

  if (!projectId) {
    return <Tag color="tomato">projectId is required</Tag>;
  }

  switch (type) {
    case "TeamFileSelector":
      return <><TeamFileSelector projectId={projectId} /></>;
    default:
      return <h1>Not Found</h1>;
  }
}
