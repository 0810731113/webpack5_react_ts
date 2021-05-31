import { useRequest } from "@umijs/hooks";
import { DataSetVO } from "api/generated/model";
import { Button } from "component/Antd";
import Loading from "component/Loading";
import { ProjectParams } from "model/route-params.model";
import React, { useEffect } from "react";
import { useRouteMatch } from "react-router";
import { workUnitService } from "service";
import { useImmer } from "use-immer";
import { CheckPermission } from "component/CheckPermission/CheckPermission";
import { publishEvent } from "function/stats.func";
import { ResourcePermissionResourceEnum } from "api-authorization/generated/model";
import { TooltipWrapper } from "component/wrapper/TooltipWrapper";
import WorkUnitList from "./components/WorkUnitList";
import WorkUnitDetailsDrawer from "./components/WorkUnitDetailsDrawer";
import AddWorkUnitDrawer from "./components/AddWorkUnitDrawer";

export interface AllWorkUnitListPageProps {}

export interface State {
  workUnits: DataSetVO[] | null;
  selectedWorkUnitId: string | null;
  showAddWorkUnit?: boolean;
}

export default function AllWorkUnitListPage(props: AllWorkUnitListPageProps) {
  const {} = props;
  const {
    url,
    path,
    params: { projectId },
  } = useRouteMatch<ProjectParams>();
  const [
    { workUnits, selectedWorkUnitId, showAddWorkUnit },
    updateState,
  ] = useImmer<State>({
    workUnits: null,
    selectedWorkUnitId: null,
  });

  const { loading, data, run } = useRequest(
    () =>
      workUnitService
        .listCloudifyWorkUnitsByProjectId(projectId, "draft")
        .then((newWorkUnits) =>
          updateState((draft) => {
            draft.workUnits = newWorkUnits ?? [];
          }),
        ),
    { manual: true },
  );

  useEffect(() => {
    run();
  }, [projectId]);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="content">
      <div className="split-toolbar">
        <CheckPermission
          resouseType={ResourcePermissionResourceEnum.CollaborationSetting}
        >
          <TooltipWrapper
            when={(tooltipWrapperProps) =>
              tooltipWrapperProps.disabled ?? false
            }
            title="处于示例项目中无该功能权限"
          >
            <Button
              type="primary"
              onClick={() => {
                publishEvent(`createWorkUnit`, ["项目配置", `协同设置`], {
                  eventLevel: "P1",
                  from: "项目工作单元页",
                });
                updateState((draft) => {
                  draft.showAddWorkUnit = true;
                });
              }}
            >
              创建工作单元
            </Button>
          </TooltipWrapper>
        </CheckPermission>
        {/* <b style={{ visibility: "hidden" }}>全部工作单元</b> */}
      </div>
      <WorkUnitList
        workUnits={workUnits ?? []}
        onDeleted={() => run()}
        onViewWorkUnit={(workUnitId) => {
          updateState((draft) => {
            draft.selectedWorkUnitId = workUnitId;
          });
        }}
      />
      <WorkUnitDetailsDrawer
        visible={!!selectedWorkUnitId}
        workUnitId={selectedWorkUnitId!}
        onClose={(refresh) => {
          updateState((draft) => {
            draft.selectedWorkUnitId = null;
          });
          if (refresh) {
            run();
          }
        }}
      />
      <AddWorkUnitDrawer
        visible={showAddWorkUnit ?? false}
        onClose={() =>
          updateState((draft) => {
            draft.showAddWorkUnit = false;
          })
        }
        onComplete={() => {
          run();
        }}
      />
    </div>
  );
}
