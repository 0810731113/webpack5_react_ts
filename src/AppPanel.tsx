import { message, Modal } from "antd";
import {
  DataSetVO,
  SpecialtyVO,
  SpecialtyVOTypeEnum,
  VersionVO,
} from "api/generated/model";
import Loading from "component/Loading";
import { onResponseError } from "function/auth.func";
import { getCookie, removeCookie } from "function/cookie.func";
import NotFoundPage from "page/NotFoundPage";
import PanelPage from "page/PanelPage/PanelPage";
import PanelPageContext, {
  ProjectContentEnum,
} from "page/PanelPage/PanelPageContext";
import React, { useEffect } from "react";
import { Route, Switch } from "react-router";
import { BrowserRouter } from "react-router-dom";
import { Subscription } from "rxjs";
import qwebService from "service/qweb.service";
import { useImmer } from "use-immer";
import { QueryParamProvider } from "use-query-params";
import "./App.less";
import "./App.scss";
import "./AppPanel.scss";
import "./style/scrollbar.css";
import PanelComponentPage from "page/PanelPage/PanelComponentPage/PanelComponentPage";
import { PanelMaintenance } from "page/UnderMaintenance";
import { useInitWss } from "hook/use-initwss.hook";
import { versionService, roleService } from "service";
import { isNumber } from "lodash";
import { ReferedVersionVO } from "page/PanelPage/ReferPage";
import { useKeyPress } from "@umijs/hooks";
import { Button } from "component/Antd";
import useScript from "react-script-hook";
import { TALKING_DATA_URL } from "consts";
import { publishEvent } from "function/stats.func";
import { ResourcePermission } from "api-authorization/generated/model";

export interface AppPanelProps {}

export interface State {
  userId: string | null;
  accessToken: string | null;
  subscription: Subscription | null;
  workUnit: DataSetVO | null;
  workUnits: DataSetVO[] | null;
  referWorkUnits: DataSetVO[] | null;
  version: VersionVO | null;
  projectId: string | null;
  openingWorkUnit: boolean;
  savingWorkUnit: boolean;
  commitingWorkUnit: boolean;
  specialtyType: SpecialtyVOTypeEnum;
  specialties?: SpecialtyVO[] | null;
  currentOperatingWorkUnitId: string | null;
  refreshCount: number;
  referingVersionIds: number[];
  referedVersions: ReferedVersionVO[];
  workunitReadonly: boolean;
  showprocess: 0 | 1;
  logs: any[];
  resources: ResourcePermission[];
  projectContent: ProjectContentEnum | null;
}

export const specialtyTypeName = {
  [SpecialtyVOTypeEnum.Unknown]: "建筑设计",
  [SpecialtyVOTypeEnum.GAP]: "建筑设计",
  [SpecialtyVOTypeEnum.GMEP]: "机电设计",
  [SpecialtyVOTypeEnum.GST]: "结构设计",
};

export default function AppPanel(props: AppPanelProps) {
  const [
    {
      userId,
      accessToken,
      workUnit,
      workUnits,
      referWorkUnits,
      version,
      projectId,
      currentOperatingWorkUnitId,
      openingWorkUnit,
      savingWorkUnit,
      commitingWorkUnit,
      specialtyType,
      specialties,
      refreshCount,
      referedVersions,
      referingVersionIds,
      workunitReadonly,
      showprocess,
      logs,
      resources,
      projectContent,
    },
    updateState,
  ] = useImmer<State>({
    userId: getCookie("accessToken") || null,
    accessToken: getCookie("userId") || null,
    specialtyType:
      (getCookie("productName") as SpecialtyVOTypeEnum) ||
      SpecialtyVOTypeEnum.Unknown,
    specialties: null,
    subscription: null,
    workUnit: null,
    workUnits: null,
    referWorkUnits: null,
    version: null,
    projectId: null,
    openingWorkUnit: false,
    savingWorkUnit: false,
    commitingWorkUnit: false,
    currentOperatingWorkUnitId: null,
    refreshCount: 0,
    referingVersionIds: [],
    workunitReadonly: false,
    showprocess: 1,
    referedVersions: [],
    logs: [],
    resources: [],
    projectContent: null,
  });
  useKeyPress(["ctrl.alt.l"], () => {
    Modal.info({
      content: logs.map((log) => (
        <div key={log}>
          {JSON.stringify(log)}
          <br />
          <Button
            onClick={() =>
              updateState((draft) => {
                draft.logs = [];
              })
            }
          >
            clear
          </Button>
        </div>
      )),
    });
  });
  const setVersion = (newVersion: VersionVO | null) => {
    updateState((draft) => {
      draft.version = newVersion;
    });
  };
  const updateVersion = () => {
    if (workUnit) {
      versionService.getLatestVersion(workUnit.id!).then((currentVersion) => {
        if (
          currentVersion &&
          isNumber(currentVersion.version) &&
          currentVersion.verifyStatus !== "illegal"
        ) {
          setVersion(currentVersion);
        }
      });
      updateState((draft) => {
        draft.refreshCount += 1;
      });
    }
  };
  const [loadingTalkingData] = useScript({
    src: TALKING_DATA_URL!,
  });
  if (!loadingTalkingData) {
    // publishEvent("打开面板", {});
  }

  function pushLog(log: any) {
    updateState((draft) => {
      draft.logs = [...draft.logs, log];
    });
  }
  function setOpeningWorkUnit(value: boolean) {
    updateState((draft) => {
      draft.openingWorkUnit = value;
    });
    if (!value) {
      publishEvent("openWorkUnit", ["工具"], {
        from: specialtyTypeName[specialtyType],
      });
    }
  }

  function setSpecialties(value?: SpecialtyVO[] | null) {
    updateState((draft) => {
      draft.specialties = value;
    });
  }

  function setSavingWorkUnit(value: boolean) {
    updateState((draft) => {
      draft.savingWorkUnit = value;
    });
  }
  function setCommitingWorkUnit(value: boolean) {
    updateState((draft) => {
      draft.commitingWorkUnit = value;
    });
  }

  function setCurrentOperationWorkUnitId(value: string | null) {
    updateState((draft) => {
      draft.currentOperatingWorkUnitId = value;
    });
  }

  useEffect(() => {
    const subscription = qwebService.subscribe((e) => {
      pushLog(e);

      // setCurrentOperationWorkUnitId(JSON.stringify(e.CollaborationClientEvent.arguments))
      const args = e.CollaborationClientEvent.arguments;
      const isSuccess = args ? args.status === "ok" : true;

      switch (e.CollaborationClientEvent.actionname) {
        case "refresh":
          updateState((draft) => {
            draft.refreshCount += 1;
          });
          break;
        case "workunitprogresslist":
          if (showprocess) {
            updateVersion();
          }
          break;
        case "workunitclosed":
          // message.info("工作单元已关闭");
          updateState((draft) => {
            draft.workUnit = null;
            draft.workunitReadonly = false;
          });
          break;
        // case "openworkingunitresult":
        //   message.info("工作单元已打开");
        //   setOpeningWorkUnit(false);
        //   setCurrentOperationWorkUnitId(null);
        //   break;
        case "workunitsaved":
          // if (isSuccess) {
          //   message.success("保存至个人成功");
          // } else {
          //   message.error(
          //     `保存至个人失败，已为您自动缓存，下次打开软件将会自动打开缓存内容(${args?.errornumber})`,
          //   );
          //   if (args && args.errornumber && args.errornumber === 3) {
          //     message.error(
          //       `数据异常，当前工作单元无法继续使用，请前往网页端恢复历史版本`,
          //     );
          //   }
          // }
          updateVersion();
          setSavingWorkUnit(false);
          setCurrentOperationWorkUnitId(null);
          break;
        case "workunitcommitted":
          // if (isSuccess) {
          //   message.success("提交至团队成功");
          // } else if (args?.status === "error") {
          //   message.error(
          //     `提交至团队失败，已为您自动缓存，下次打开软件将会自动打开缓存内容(${args?.errornumber})`,
          //   );
          //   if (args && args.errornumber && args.errornumber === 3) {
          //     message.error(
          //       `数据异常，当前工作单元无法继续使用，请前往网页端恢复历史版本`,
          //     );
          //   }
          // }
          updateVersion();
          setCommitingWorkUnit(false);
          setCurrentOperationWorkUnitId(null);
          break;
        case "logouted":
          removeCookie("userId");
          removeCookie("accessToken");
          window.location.reload();
          break;
        default:
          break;
      }
    });
    updateState((draft) => {
      draft.subscription = subscription;
    });
    return () => {
      subscription?.unsubscribe();
    };
  }, [workUnit, showprocess]);

  useInitWss();

  // 当projectId变了的时候，重新获取resouces权限
  useEffect(() => {
    if (projectId) {
      roleService.getMyResourcesByProjectId(projectId).then((ress) => {
        updateState((draft) => {
          draft.resources = ress;
        });
      });
    }
  }, [projectId]);

  if (!userId || !accessToken) {
    return (
      <div className="panel-page content-page">
        <Loading absolute size={32} message="请先登录" />
      </div>
    );
  }

  return (
    <PanelPageContext.Provider
      value={{
        userId,
        accessToken,
        workUnit,
        workUnits,
        version,
        projectId,
        specialtyType,
        specialties,
        currentOperatingWorkUnitId,
        openingWorkUnit,
        savingWorkUnit,
        commitingWorkUnit,
        referingVersionIds,
        workunitReadonly,
        refreshCount,
        showprocess,
        referedVersions,
        logs,
        referWorkUnits,
        resources,
        projectContent,
        // workUnitId: "ee7ca2aa-2d63-4872-ace4-b68b82124e2d",
        // projectId: "1eba4c5d-6953-4437-8767-30860576c543",
        // setOpeningWorkUnit(value) {
        //   updateState((draft) => {draft.openingWorkUnit = value});
        // },
        setShowprocess(newShowprocess) {
          updateState((draft) => {
            draft.showprocess = newShowprocess;
          });
        },
        setWorkUnit(newWorkUnit) {
          updateState((draft) => {
            draft.workUnit = newWorkUnit;
          });
        },
        setWorkUnits(newWorkUnits) {
          updateState((draft) => {
            draft.workUnits = newWorkUnits;
          });
        },
        setReferWorkUnits(newReferWorkUnits) {
          updateState((draft) => {
            draft.referWorkUnits = newReferWorkUnits;
          });
        },
        setVersion,
        resetProject() {
          updateState((draft) => {
            draft.projectId = null;
            draft.version = null;
            draft.workUnit = null;
            draft.referWorkUnits = null;
            draft.referingVersionIds = [];
            draft.referedVersions = [];
          });
        },
        setProjectId(id) {
          updateState((draft) => {
            draft.projectId = id;
          });
        },
        setReferingVersionIds(ids) {
          updateState((draft) => {
            draft.referingVersionIds = ids;
          });
        },
        setReferedVersions(newReferedVersions) {
          updateState((draft) => {
            draft.referedVersions = newReferedVersions;
          });
        },
        pushLog,
        setSpecialties,
        setOpeningWorkUnit,
        setSavingWorkUnit,
        setCommitingWorkUnit,
        setCurrentOperationWorkUnitId,
        setWorkunitReadonly(readonly) {
          updateState((draft) => {
            draft.workunitReadonly = readonly;
          });
        },
        setProjectContent(content) {
          updateState((draft) => {
            draft.projectContent = content;
          });
        },
        onResponseError(error) {
          onResponseError(error);
          if (error.response?.status === 401) {
            updateState((draft) => {
              draft.userId = null;
              draft.accessToken = null;
            });
          }
        },
      }}
    >
      <BrowserRouter basename="/web">
        <QueryParamProvider ReactRouterRoute={Route}>
          <Switch>
            <Route path="/panel" exact component={PanelPage} />
            <Route path="/maintenance" component={PanelMaintenance} />
            <Route
              path="/panel/components/:type"
              component={PanelComponentPage}
            />
            <Route path="*" component={NotFoundPage} />
          </Switch>
        </QueryParamProvider>
      </BrowserRouter>
    </PanelPageContext.Provider>
  );
}
