import React, { useEffect } from "react";
import { Switch, Route, useRouteMatch, useHistory } from "react-router";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { ArchiveParams } from "model/route-params.model";
import { Link } from "react-router-dom";
import { useImmer } from "use-immer";
import { Button, message, Divider, Modal } from "antd";
import { archiveService } from "service";
import { size, replace } from "lodash";
import Loading from "component/Loading";
import { ResourceTypeEnum } from "api/generated/model";
import { useRequest } from "@umijs/hooks";
import { CheckPermission } from "component/CheckPermission/CheckPermission";
import { ResourcePermissionResourceEnum } from "api-authorization/generated/model";
import { TooltipWrapper } from "component/wrapper/TooltipWrapper";
import SiderSelector from "../SiderSelector";
import BaseArchiveForm from "./BaseArchiveForm";
import DeliveryUnitsList from "../DeliveryUnitsList";

interface ArchiveEditPageProps {}

interface State {
  section: "info" | "workunit";
  name: string;
  description: string;
  errorNoName: boolean;
  errorNoContent: boolean;
  selectedVersionIds: number[];
  apiLoading: boolean;
}

export default function ArchiveEditPage(props: ArchiveEditPageProps) {
  const {} = props;
  const [
    {
      section,
      name,
      description,
      errorNoName,
      errorNoContent,
      selectedVersionIds,
      apiLoading,
    },
    updateState,
  ] = useImmer<State>({
    section: "info",
    name: "",
    description: "",
    errorNoName: false,
    errorNoContent: false,
    apiLoading: false,
    selectedVersionIds: [],
  });
  const {
    url,
    path,
    params: { projectId, archiveId },
  } = useRouteMatch<ArchiveParams>();

  const { replace } = useHistory();

  const loader = async () => {
    const data = await archiveService.getArchiveInfoByPackageId(archiveId);

    return data;
  };

  const { data, loading, run } = useRequest(loader);

  useEffect(() => {
    const name = data?.package.name;
    const description = data?.package.description;

    const version = data?.versions[0];
    const ids = version?.content?.map((res) => parseInt(res.resourceId!));

    updateState((draft) => {
      draft.name = name ?? "";
      draft.description = description ?? "";
      draft.selectedVersionIds = ids ?? [];
    });
  }, [data]);

  const modifyAndSave = () => {
    if (!name) {
      updateState((draft) => void (draft.errorNoName = true));
      return;
    }
    if (size(selectedVersionIds) === 0) {
      updateState((draft) => void (draft.errorNoContent = true));
      return;
    }

    const version = data?.versions[0];
    if (!version || (version.version !== 1 && !version.version)) {
      alert("交付包版本错误");
      return;
    }

    Modal.confirm({
      title: `完成项目交付包提示`,
      content: `完成项目交付包后无法再次修改，是否继续创建？`,
      okText: "确定",
      cancelText: "取消",
      onOk() {
        return archiveService
          .updateArchive(archiveId, version.id!, name, description)
          .then(() => archiveService
              .commitDraftAchiveResources(
                archiveId,
                selectedVersionIds,
                version.version!,
              )
              .then(() => {
                replace(backUrl());
                message.success("交付包创建完成");
              }));
      },
    });
  };

  const modifyAndDraft = () => {
    if (!name) {
      updateState((draft) => void (draft.errorNoName = true));
      return;
    }

    const version = data?.versions[0];
    if (!version || (version.version !== 1 && !version.version)) {
      alert("交付包版本错误");
      return;
    }

    updateState((draft) => void (draft.apiLoading = true));

    return archiveService
      .updateArchive(archiveId, version.id!, name, description)
      .then((id) => {
        return archiveService
          .updateDraftAchiveResources(
            archiveId,
            selectedVersionIds,
            version.version!,
          )
          .then(() => {
            replace(backUrl());
            message.success("交付包存草稿成功");
          });
      })
      .finally(() => {
        updateState((draft) => void (draft.apiLoading = false));
      });
  };

  const backUrl = () => {
    const arr = url.split("/");
    arr.pop();
    arr.pop();
    return arr.join("/");
  };

  if (loading || !data || !data.package || !data.versions) {
    return <Loading />;
  } 
    return (
      <>
        <div className="header">
          <div>
            <Link to={backUrl()}>
              <ArrowLeftOutlined /> 返回
            </Link>
            <Divider type="vertical" />
            <span>{data.package.name}</span>
          </div>
        </div>

        <SiderSelector
          InfoComp={
            <BaseArchiveForm
              info={{ name, description }}
              onChangeInfo={(info) => {
                updateState((draft) => {
                  draft.name = info.name;
                  draft.description = info.description;
                  if (name) {
                    draft.errorNoName = false;
                  }
                });
              }}
            />
          }
          UnitComp={
            <DeliveryUnitsList
              selectedUnitIds={selectedVersionIds}
              showDelete={false}
              onCheckUnits={(ids) => {
                updateState((draft) => {
                  draft.selectedVersionIds = ids;
                  if (size(ids) > 0) {
                    draft.errorNoContent = false;
                  }
                });
              }}
            />
          }
        />

        <div className="footer">
          <div>
            <span className="error">
              {errorNoName
                ? "*请填写交付包名称"
                : errorNoContent && "*请至少选择一个交付单元或交付文档"}
            </span>

            <Link to={backUrl()}>
              <Button>取消</Button>
            </Link>
            <CheckPermission
              resouseType={ResourcePermissionResourceEnum.ArchivePackage}
            >
              <TooltipWrapper
                when={(props) => props.disabled ?? false}
                title="处于示例项目中无该功能权限"
              >
                <Button
                  loading={apiLoading}
                  onClick={modifyAndDraft}
                  style={{ marginLeft: 8 }}
                >
                  存草稿
                </Button>
              </TooltipWrapper>

              <TooltipWrapper
                when={(props) => props.disabled ?? false}
                title="处于示例项目中无该功能权限"
              >
                <Button
                  loading={apiLoading}
                  type="primary"
                  onClick={modifyAndSave}
                  style={{ marginLeft: 8 }}
                >
                  完成
                </Button>
              </TooltipWrapper>
            </CheckPermission>
          </div>
        </div>
      </>
    );
  
}
