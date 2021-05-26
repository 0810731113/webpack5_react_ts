/* eslint-disable camelcase */
/* eslint-disable no-return-assign */
import React, { useEffect } from "react";
import { Switch, Route, useRouteMatch, Prompt, useHistory } from "react-router";
import { ProjectParams } from "model/route-params.model";
import { useImmer } from "use-immer";
import "./GridSettingsPage.scss";
import { NAV } from "consts";
import useNavMenu from "hook/use-nav-menu.hook";
import { gridSettingsService, spaceSettingsService } from "service";
import { Button } from "component/Antd";
import {
  LeaveConfirmText,
  confirmWindow,
} from "component/LeaveConfirm/default";
import { AxisGrid } from "three-engine/bim/model/objects/axisgrid";
import { checkDuplicateGridName, checkEmptyGridName } from "function/grid.func";
import { message, Space, Modal } from "antd";

import { CheckPermission } from "component/CheckPermission/CheckPermission";
import { GridType } from "service/grid.settings.service";
import { CountDuration } from "function/timer.func";
import { publishEvent } from "function/stats.func";
import {
  ResourcePermissionResourceEnum,
  ResourcePermissionPermissionTypesEnum,
} from "api-authorization/generated/model";
import { TooltipWrapper } from "component/wrapper/TooltipWrapper";
import CanvasToolBar from "./CanvasToolBar";
import CompassSetting from "./CompassSetting";

const { Engine } = require("three-engine/engine");
const { Application } = require("three-engine/core/application");
const { Viewer2d } = require("three-engine/bim/display/2d/viewer");
const { Font } = require("three-engine/core/model/font");

interface GridSettingsPageProps {}

interface State {
  editMode: boolean;
  version: number;
}

export default function GridSettingsPage(props: GridSettingsPageProps) {
  const {} = props;
  const [{ editMode, version }, updateState] = useImmer<State>({
    editMode: false,
    version: 0,
  });
  const {
    url,
    path,
    params: { projectId },
  } = useRouteMatch<ProjectParams>();

  const history = useHistory();

  // useNavMenu(NAV.settingsZhouWang);

  const loadConfig = () => {
    gridSettingsService.get(projectId).then((res) => {
      AxisGrid.get().fromJson(res.data, res.schemaVersion);
      updateState((draft) => void (draft.version = res.version ?? 0));
    });
  };

  const checkData = () => {
    const p = AxisGrid.get();
    if (p) {
      const json = p.toJson();
      const axisCurves = json.axis.lines.concat(json.axis.arcs);
      if (checkEmptyGridName(axisCurves)) {
        message.error("检测到空白轴号，请检查");
        return false;
      }

      if (checkDuplicateGridName(axisCurves)) {
        message.error("检测到重名轴号，请检查");
        return false;
      }
    }
    return true;
  };
  const onEndEdit = (isSuccess: boolean) => {
    CountDuration.end();
    const secs = CountDuration.getSecs();

    // if (isSuccess) {
    //   publishEvent("web编辑轴网时长", {
    //     success: `${secs  }秒`,
    //   });
    // } else {
    //   publishEvent("web编辑轴网时长", {
    //     quit: `${secs  }秒`,
    //   });
    // }

    updateState((draft) => void (draft.editMode = false));
    Application.instance().isAxisGridEditMode = false;
  };
  const saveConfig = async () => {
    const p = AxisGrid.get();
    if (p) {
      const json = p.toJson();

      const ver = await gridSettingsService.update(projectId, json);
      message.success("应用成功");
      updateState((draft) => void (draft.version = ver ?? 0));
    }
    onEndEdit(true);
  };

  const onStartEdit = async () => {
    CountDuration.start();

    updateState((draft) => void (draft.editMode = true));
    Application.instance().isAxisGridEditMode = true;
  };

  const g_domId = "grid";

  const initView = () => {
    const instance = Application.instance();
    if (instance && instance.viewers) {
      Application.instance().viewerManager.register(g_domId, new Viewer2d());
      const viewerGrid = instance.viewers.get(g_domId);
      viewerGrid.init(g_domId);
      viewerGrid.activate();

      loadConfig();
    }
  };
  const onResize = (e: any) => {
    const { viewers } = Application.instance();
    const viewer = viewers.get(g_domId);
    viewer.resize(g_domId);
  };
  const onBegin = () => {
    Engine.boot();
    window.addEventListener("resize", onResize, false);
    new Font().load();
    initView();
  };

  const onEnd = () => {
    window.removeEventListener("resize", onResize, false);
    Engine.exit();
  };

  useEffect(() => {
    onBegin();
    return () => {
      onEnd();
    };
  }, []);

  useEffect(() => {
    gridSettingsService.getGridType(projectId).then((gridType) => {
      if (gridType === null) {
        onStartEdit();
      }
    });
  }, []);

  return (
    <div className="grid-page">
      <div className="header">轴网</div>
      <div className="body">
        <div id="grid" className="canvas-container">
          <CompassSetting editMode={editMode} />
          <CanvasToolBar editMode={editMode} />
        </div>
      </div>
      <div className="footer">
        <Prompt when={editMode} message={LeaveConfirmText} />

        {editMode ? (
          <Space size="middle">
            <span>
              轴网版本：<span className="editing-text">（编辑中）</span>
            </span>

            <CheckPermission
              resouseType={ResourcePermissionResourceEnum.ProjectSetting}
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
                    if (checkData()) {
                      if (version === 0) {
                        Modal.confirm({
                          title: `风险提示`,
                          content: `由于两种轴网数据目前暂时不兼容，创建轴网后无法更换绘制方式`,
                          cancelText: "我已了解风险，确定选择",
                          okText: "我再想想",
                          okButtonProps: { ghost: true },
                          onOk() {
                            return Promise.resolve(true);
                          },
                          onCancel() {
                            gridSettingsService
                              .postGridType(projectId, GridType.GDCP)
                              .then(() => {
                                saveConfig();
                              });
                          },
                        });
                      } else {
                        saveConfig();
                      }
                    }
                  }}
                >
                  应用
                </Button>
              </TooltipWrapper>
            </CheckPermission>

            <Button
              type="primary"
              ghost
              onClick={() => {
                if (version === 0) {
                  // onEndEdit(false);  //不能统一，不然会跳两次confirmwindow
                  history.replace(`${url.split("/gdcp")[0]}/welcome`);
                } else {
                  confirmWindow(() => {
                    onEndEdit(false);
                    loadConfig();
                  });
                }
              }}
            >
              取消
            </Button>
          </Space>
        ) : (
          <Space size="middle">
            <span>轴网版本：V{version}</span>
            <CheckPermission
              resouseType={ResourcePermissionResourceEnum.ProjectSetting}
              writeCondition={(rights) =>
                rights?.includes(
                  ResourcePermissionPermissionTypesEnum.SoftWrite,
                ) ?? false
              }
            >
              <Button type="primary" onClick={() => onStartEdit()}>
                编辑
              </Button>
            </CheckPermission>
          </Space>
        )}
      </div>
    </div>
  );
}
