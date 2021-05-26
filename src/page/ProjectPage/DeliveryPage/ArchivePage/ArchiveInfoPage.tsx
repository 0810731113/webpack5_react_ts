import React, { useEffect } from "react";
import { Switch, Route, useRouteMatch } from "react-router";
import { ProjectParams, ArchiveParams } from "model/route-params.model";
import { Link } from "react-router-dom";
import { useImmer } from "use-immer";
import { archiveService } from "service";
import { useRequest } from "@umijs/hooks";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button, message, Divider, Space } from "antd";
import BaseArchiveForm from "./BaseArchiveForm";
import DeliveryUnitsList from "../DeliveryUnitsList";
import SiderSelector from "../SiderSelector";

interface ArchiveInfoPageProps {}

interface State {
  selectedVersionIds: number[];
}

export default function ArchiveInfoPage(props: ArchiveInfoPageProps) {
  const {} = props;
  const [{ selectedVersionIds }, updateState] = useImmer<State>({
    selectedVersionIds: [],
  });
  const {
    url,
    path,
    params: { projectId, archiveId },
  } = useRouteMatch<ArchiveParams>();

  const loader = async () => {
    const data = await archiveService.getArchiveInfoByPackageId(archiveId);

    return data;
  };

  const { data, loading, run } = useRequest(loader);

  useEffect(() => {
    const version = data?.versions[0];
    const ids = version?.content?.map((res) => parseInt(res.resourceId!));
    updateState((draft) => {
      draft.selectedVersionIds = ids ?? [];
    });
  }, [data]);

  const backUrl = () => {
    const arr = url.split("/");
    arr.pop();
    arr.pop();
    return arr.join("/");
  };

  return (
    <>
      <div className="header">
        <div>
          <Link to={backUrl()}>
            <ArrowLeftOutlined /> 返回
          </Link>
          <Divider type="vertical" />

          <span>项目交付名称</span>
        </div>
      </div>
      <SiderSelector
        InfoComp={
          <BaseArchiveForm
            isEdit={false}
            info={{
              name: data?.package.name ?? "error name",
              description: data?.package.description ?? "",
            }}
          />
        }
        UnitComp={
          <DeliveryUnitsList
            showDelete={false}
            selectedUnitIds={selectedVersionIds}
            showSelectedOnly
          />
        }
      />
    </>
  );
}
