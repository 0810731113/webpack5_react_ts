import React, { useEffect, useCallback, useContext } from "react";
import { Switch, Route, useRouteMatch } from "react-router";
import { ProjectParams } from "model/route-params.model";
import { Link } from "react-router-dom";
import { useImmer } from "use-immer";
import "./ProjectInfoSettings.scss";
import { projectService } from "service";
import Loading from "component/Loading";
import { Project, ProjectVO } from "api/generated/model";

import useNavMenu from "hook/use-nav-menu.hook";
import { NAV } from "consts";

import { useRequest } from "@umijs/hooks";
import { CheckPermission } from "component/CheckPermission/CheckPermission";
import { publishEvent } from "function/stats.func";
import { ResourcePermissionResourceEnum } from "api-authorization/generated/model";
import { TooltipWrapper } from "component/wrapper/TooltipWrapper";
import { message, Button } from "antd";
import { onResponseError } from "function/auth.func";
import InfoProjectForm from "./InfoProjectForm";
import ProjectActionModal from "./ProjectActionModal";
import { fetchAdressData } from "./SelectAddress";
import { extractDataFromStandardObj } from "function/standard.func";

interface ProjectInfoSettingsProps {}

interface State {
  showEdit: boolean;
}

export default function ProjectInfoSettings(props: ProjectInfoSettingsProps) {
  const {} = props;
  const [{ showEdit }, updateState] = useImmer<State>({
    showEdit: false,
  });
  const {
    url,
    path,
    params: { projectId },
  } = useRouteMatch<ProjectParams>();
  useNavMenu(NAV.settingsProjectOverview);
  const loader = () => projectService.loadProjectById(projectId);
  const { loading, data, run } = useRequest<ProjectVO>(loader, {
    manual: true,
  });

  const onEdit = (info: Project) =>
    projectService.modifyProject(info).then(() => {
      message.success("项目信息修改成功");
      run();
      updateState((draft) => {
        draft.showEdit = false;
      });
    });

  useEffect(() => {
    run();
  }, []);

  if (loading || !data) {
    return <Loading />;
  }
  return (
    <div className="info-project">
      <div className="body">
        <div className="detail">
          <div className="header">
            <span className="title">项目信息</span>

            <CheckPermission
              resouseType={ResourcePermissionResourceEnum.ProjectSummary}
            >
              <TooltipWrapper
                when={(tooltipProps) => tooltipProps.disabled ?? false}
                title="处于示例项目中无该功能权限"
              >
                <Button
                  type="primary"
                  onClick={() => {
                    // publishEvent("编辑项目概况", {
                    //   前向来源: "项目概况编辑按钮",
                    // });
                    updateState((draft) => {
                      draft.showEdit = true;
                    });
                  }}
                >
                  编辑
                </Button>
              </TooltipWrapper>
            </CheckPermission>
          </div>

          <InfoProjectForm
            info={{
              ...data,
              ...fetchAdressData(data),
              ...extractDataFromStandardObj(
                [
                  "buildingType",
                  "structureType",
                  "buildingEnterprise",
                  "designEnterprise",
                ],
                data?.standardProperties ?? [],
              ),
            }}
            type="showinfo"
          />
        </div>
      </div>

      <ProjectActionModal
        type="edit"
        visible={showEdit}
        projectId={data.id ?? ""}
        onClose={() =>
          updateState((draft) => {
            draft.showEdit = false;
          })
        }
        onOK={onEdit}
      />
    </div>
  );
}
