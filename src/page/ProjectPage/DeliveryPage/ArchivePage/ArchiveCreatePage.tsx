import React, { useEffect, useState } from "react";
import { Switch, Route, useRouteMatch, useHistory, Prompt } from "react-router";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { ProjectParams } from "model/route-params.model";
import { Link } from "react-router-dom";
import { useImmer } from "use-immer";
import { Button, message, Divider, Modal } from "antd";
import { archiveService } from "service";
import { size, replace } from "lodash";
import { ResourceTypeEnum } from "api/generated/model";
import BaseArchiveForm from "./BaseArchiveForm";
import DeliveryUnitsList from "../DeliveryUnitsList";
import SiderSelector from "../SiderSelector";

interface ArchiveCreatePageProps {}

interface State {
  name: string;
  description: string;
  errorNoName: boolean;
  errorNoContent: boolean;
  selectedVersionIds: number[];
  apiLoading: boolean;
}

export default function ArchiveCreatePage(props: ArchiveCreatePageProps) {
  const {} = props;
  const [
    {
      name,
      description,
      errorNoName,
      errorNoContent,
      selectedVersionIds,
      apiLoading,
    },
    updateState,
  ] = useImmer<State>({
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
    params: { projectId },
  } = useRouteMatch<ProjectParams>();

  const { replace } = useHistory();
  const backUrl = url.split("/create")[0];

  const [leaveConfirm, setLeaveConfirm] = useState(true);

  const createAndSave = () => {
    if (!name) {
      updateState((draft) => void (draft.errorNoName = true));
      return;
    }

    if (size(selectedVersionIds) === 0) {
      updateState((draft) => void (draft.errorNoContent = true));
      return;
    }

    setLeaveConfirm(false);

    Modal.confirm({
      title: `创建项目交付包提示`,
      content: `创建项目交付包后无法再次修改，是否继续创建？`,
      okText: "确定",
      cancelText: "取消",
      onOk() {
        return archiveService
          .createArchive(projectId, name, description)
          .then((res) => {
            const newArchiveId = res?.id;
            if (newArchiveId) {
              return newArchiveId;
            } 
              return Promise.reject("id error");
            
          })
          .then((id) => archiveService
              .postAchiveResources(id, selectedVersionIds)
              .then(() => {
                replace(backUrl);
                message.success("交付包创建成功");
              }));
      },
    });
  };

  const createAndDraft = () => {
    if (!name) {
      updateState((draft) => void (draft.errorNoName = true));
      return;
    }

    setLeaveConfirm(false);
    updateState((draft) => void (draft.apiLoading = true));

    return archiveService
      .createArchive(projectId, name, description)
      .then((res) => {
        const newArchiveId = res?.id;
        if (newArchiveId) {
          return newArchiveId;
        } 
          return Promise.reject("id error");
        
      })
      .then((id) => {
        archiveService
          .postDraftAchiveResources(id, selectedVersionIds)
          .then(() => {
            replace(backUrl);
            message.success("交付包存草稿成功");
          });
      })
      .finally(() => {
        updateState((draft) => void (draft.apiLoading = false));
      });
  };

  return (
    <>
      <Prompt when={leaveConfirm} message="是否放弃创建项目交付包" />
      <div className="header">
        <div>
          <Link to={backUrl}>
            <ArrowLeftOutlined /> 返回
          </Link>
          <Divider type="vertical" />
          <span>创建项目交付包</span>
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

          <Link to={backUrl}>
            <Button>取消</Button>
          </Link>
          <Button
            loading={apiLoading}
            onClick={createAndDraft}
            style={{ marginLeft: 8 }}
          >
            存草稿
          </Button>
          <Button
            type="primary"
            onClick={createAndSave}
            style={{ marginLeft: 8 }}
          >
            创建
          </Button>
        </div>
      </div>
    </>
  );
}
