import React, { Fragment, useEffect, useState, MutableRefObject } from "react";
import { Alert, Drawer, message, Button } from "antd";
import { fileService, issueService, authService } from "service";
import { MenuOutlined, PlusOutlined } from "@ant-design/icons";
// import { getCookie, dataURLtoFile } from "@/app/ui/utils/common";
import {
  StringParam,
  withDefault,
  useQueryParams,
  ArrayParam,
  BooleanParam,
  NumberParam,
} from "use-query-params";
// import issueApi from "@/request/bimmodel/issueApi";
// import FileStoreApi from "@/request/bimmodel/filestorehelpler";
import { useImmer } from "use-immer";
import { dataURLtoFile } from "function/common.func";
import "./IssueView.scss";
import { useRecoilState, useRecoilValue } from "recoil";
import bimfacePageState from "state/bimface.state";
import { CommaNumberArrayParam } from "function/route.func";
import { TreeNode } from "api/generated/model";
import cropImageState from "state/crop-image.state";
import produce from "immer";
import IssueDetailMini from "./IssueDetailMini";
import IssueList from "./IssueList";
import NewIssueModal from "./NewIssueModal";

interface cemeraFieldMap {
  field: string | string[];
  valueField?: string | string[];
}

// 数组的索引是版本号 即： 0，1,2,3 分别是 版本 0， 1， 2， 3
export const cameraMapVersions: cemeraFieldMap[][] = [
  [
    { field: "name", valueField: "name" },
    { field: "fov" },
    { field: "zoom" },
    { field: "version" },
    { field: "coordinateSystem" },
    { field: ["position", "x"] },
    { field: ["position", "y"] },
    { field: ["position", "z"] },
    { field: ["target", "x"] },
    { field: ["target", "y"] },
    { field: ["target", "z"] },
    { field: ["up", "x"] },
    { field: ["up", "y"] },
    { field: ["up", "z"] },
  ],
];

declare const Glodon: any;

// function getQueryVariable(variable) {
//   var query = window.location.search.substring(1);
//   var vars = query.split("&");
//   for (var i = 0; i < vars.length; i++) {
//     var pair = vars[i].split("=");
//     if (pair[0] == variable) {
//       return pair[1];
//     }
//   }
//   return false;
// }
interface IssueViewProps {
  view3d: MutableRefObject<any | null>;
  fileIdList: string[];
  versionIdList: number[];
}
interface IssueViewState {
  element: any;
  refreshTag: number;
  solvingCount: number;
  bimfaceCamera?: any;
}
const IssueView = (props: IssueViewProps) => {
  const { view3d, fileIdList } = props;
  const [
    {
      newModalVisible,
      title,
      versionIdList,
      isShowIssues,
      activeIssueId,
      hideIssueList,
      fromNewButton,
    },
    setQuery,
  ] = useQueryParams({
    title: withDefault(StringParam, undefined),
    versionIdList: withDefault(CommaNumberArrayParam, []),
    isShowIssues: withDefault(BooleanParam, false),
    newModalVisible: withDefault(BooleanParam, false),
    fromNewButton: withDefault(BooleanParam, false),
    hideIssueList: withDefault(BooleanParam, false),
    activeIssueId: withDefault(NumberParam, undefined),
  });
  const [state, setState] = useRecoilState(cropImageState);
  const { cropping } = useRecoilValue(cropImageState);
  const [{ elementTreeData, versionList }] = useRecoilState(bimfacePageState);
  const unitIds = versionList?.map((version) => version.dataSetId!);
  const workUnits =
    elementTreeData?.reduce<TreeNode[]>(
      (result, item) => [...result, ...(item.items ?? [])],
      [],
    ) ?? [];
  const [{ element, refreshTag, solvingCount, bimfaceCamera }, update] =
    useImmer<IssueViewState>({
      element: null,
      refreshTag: Math.random(),
      solvingCount: 0,
      bimfaceCamera: undefined,
    });
  const refreshIssueList = () => {
    update((draft) => {
      draft.refreshTag = Math.random();
    });
  };
  useEffect(() => {
    if (!isShowIssues) {
      setQuery({ newModalVisible: false, fromNewButton: false });
    } else {
      refreshIssueList();
    }
  }, [isShowIssues]);

  const contextMenuCallback = () => {
    const curIsShowIssues = isShowIssues;
    // const curIsShowIssues = getQueryVariable("isShowIssues");
    if (
      curIsShowIssues &&
      fileIdList.some(
        (fileId) =>
          view3d?.current?.getModel(fileId)?.getSelectedComponents()?.length,
      )
    ) {
      const rightMenu = document.getElementsByClassName("bf-menu-right")[0];
      if (rightMenu) {
        const spacer = document.createElement("DIV");
        spacer.className = "bf-spacer";
        const menuItem = document.createElement("DIV");
        menuItem.className = "bf-menu-item";
        menuItem.innerHTML = "新建问题";
        menuItem.onclick = () => {
          setQuery({ newModalVisible: true, fromNewButton: false });
          rightMenu.remove();
        };
        rightMenu.appendChild(spacer);
        rightMenu.appendChild(menuItem);
      }
    }
  };

  useEffect(() => {
    const selectionChangedHandler = (event: any) => {
      if (!event || event.length === 0) {
        update((draft) => {
          draft.element = {};
        });
      }
    };

    const mouseClickedHandler = (event: any) => {
      update((draft) => {
        let elementName = "";
        let unitId: string = "";
        elementTreeData?.find(
          (el) =>
            el.items &&
            el.items.find(
              (unit) =>
                unit.items &&
                unit.items.find((child) => {
                  if (child.bfId?.toString() === event.elementId?.toString()) {
                    elementName = `${child.name || ""} [${child.id?.substr(
                      -6,
                      6,
                    )}]`;
                    unitId = unit.id!;
                  }
                  return child.bfId?.toString() === event.elementId?.toString();
                }),
            ),
        );
        draft.element = {
          unitId,
          elementName,
          elementId: event.elementId,
          worldPosition: event.worldPosition,
        };
      });
      if (event.eventType === "RightClick") {
        if (event.elementId) {
          fileIdList.forEach((fileId) =>
            view3d?.current
              ?.getModel(fileId)
              ?.setSelectedComponentsById([event.elementId]),
          );
        } else {
          fileIdList.forEach((fileId) =>
            view3d?.current?.getModel(fileId)?.clearSelectedComponents(),
          );
        }
      }
    };
    if (!hideIssueList && view3d?.current) {
      view3d?.current?.addEventListener(
        Glodon.Bimface.Viewer.Viewer3DEvent.SelectionChanged,
        selectionChangedHandler,
      );
      view3d?.current?.addEventListener(
        Glodon.Bimface.Viewer.Viewer3DEvent.MouseClicked,
        mouseClickedHandler,
      );
    }
    return () => {
      view3d?.current?.removeEventListener(
        Glodon.Bimface.Viewer.Viewer3DEvent.SelectionChanged,
        selectionChangedHandler,
      );
      view3d?.current?.removeEventListener(
        Glodon.Bimface.Viewer.Viewer3DEvent.MouseClicked,
        mouseClickedHandler,
      );
    };
  }, [view3d?.current, elementTreeData]);
  useEffect(() => {
    if (!hideIssueList) {
      if (view3d) {
        const listener = (event: any) => {
          setTimeout(contextMenuCallback);
        };
        view3d?.current?.addEventListener(
          Glodon.Bimface.Viewer.Viewer3DEvent.ContextMenu,
          listener,
        );
        return () => {
          view3d?.current?.removeEventListener(
            Glodon.Bimface.Viewer.Viewer3DEvent.ContextMenu,
            listener,
          );
        };
      }
    }
  }, [view3d?.current, isShowIssues]);
  const commitNewIssue = async ({
    title: newTitle,
    description,
    workUnitId,
    croppedDataURL,
  }: {
    title: string;
    description?: string;
    workUnitId: string;
    croppedDataURL?: string | null;
  }) => {
    const userId = authService.getUserId()!;
    const colorRed = new Glodon.Web.Graphics.Color(92, 92, 92, 1);

    const image = view3d?.current?.createSnapshotAsync(
      colorRed,
      async (data: any) => {
        const file = dataURLtoFile(croppedDataURL || data);
        const fileUrl = await fileService.simpleSaveFile(file);
        // const fileUrl = (await FileStoreApi.simpleSaveFile(file)).data;
        let elementName = "";
        let currentTeamId: string = "";
        let elementId: string = "";
        elementTreeData?.find(
          (el) =>
            el.items &&
            el.items.find((unit) => {
              if (element?.elementId) {
                return (
                  unit.items &&
                  unit.items.find((child) => {
                    if (
                      child.bfId?.toString() === element.elementId.toString()
                    ) {
                      elementName = `${child.name} [${child.id?.substr(
                        -6,
                        6,
                      )}]`;
                      currentTeamId = el.id!;
                      elementId = child.id!;
                    }
                    return (
                      child.bfId?.toString() === element.elementId.toString()
                    );
                  })
                );
              }
              if (workUnitId && unit.id === workUnitId) {
                elementName = ``;
                currentTeamId = el.id!;
                elementId = "";
                return true;
              }
              return false;
            }),
        );
        if (!currentTeamId) {
          message.error(`所选构件 ${elementName} 没有所属团队`);
          return;
        }
        // const bimfaceCamera = view3d?.current?.getCameraStatus();
        const cameraMap = cameraMapVersions[cameraMapVersions.length - 1];
        const readValue = (field: string | string[]) =>
          typeof field === "string"
            ? bimfaceCamera?.[field]
            : field.reduce((value, key) => value?.[key], bimfaceCamera);
        const camera = cameraMap.reduce(
          (result: any, item) => {
            if (typeof item.field === "string") {
              return {
                ...result,
                [item.field]: readValue(item.valueField || item.field),
              };
            }
            item.field.reduce((value, key, index) => {
              if (!value[key] && index !== item.field.length - 1) {
                value[key] = {};
              } else if (item.field.length - 1 === index) {
                value[key] = readValue(item.valueField || item.field);
              }
              return value[key];
            }, result);
            return result;
          },
          { cameraVersion: cameraMapVersions.length - 1 },
        );
        const result = await issueService.createIssue({
          title: newTitle,
          description,
          elementId,
          userId,
          teamId: currentTeamId,
          file: fileUrl,
          camera: JSON.stringify(camera),
          elementName,
          issueDatasets: versionIdList
            .filter(Boolean)
            ?.map((versionId, index) => ({
              versionId: versionId || undefined,
              isCurrent: versionList?.some(
                (version) =>
                  version.dataSetId === workUnitId && version.id === versionId,
              )
                ? 1
                : 0,
            })),
          markCoordinate: JSON.stringify(element?.worldPosition ?? ""),
        });
        if (result) {
          setState(
            produce(state, (draft) => {
              draft.croppedDataURL = null;
              draft.cropping = false;
            }),
          );
          setQuery({ newModalVisible: false, fromNewButton: false });
          refreshIssueList();
          message.success("问题创建成功，消息已推送至指定工作单元的负责人");
        }
      },
    );
  };
  useEffect(() => {
    if (newModalVisible) {
      const colorRed = new Glodon.Web.Graphics.Color(92, 92, 92, 1);
      const image = view3d?.current?.createSnapshotAsync(
        colorRed,
        async (data: any) => {
          setState(
            produce(state, (draft) => {
              draft.croppedDataURL = data;
              draft.cropping = false;
            }),
          );
        },
      );
    }
  }, [newModalVisible]);
  useEffect(() => {
    update((draft) => {
      draft.bimfaceCamera =
        state.croppedDataURL && view3d?.current?.getCameraStatus();
    });
  }, [state.croppedDataURL]);

  return (
    <div>
      {!hideIssueList && isShowIssues && (
        <Alert
          message="请右键单击构件以创建一个问题"
          className="new-issue-alert"
        />
      )}
      <Drawer
        width={320}
        className="issue-drawer"
        title={
          !hideIssueList ? (
            <span>
              <MenuOutlined /> {title || "整合查看"}中的问题({solvingCount}
              个待解决)
            </span>
          ) : (
            false
          )
        }
        placement="right"
        mask={false}
        closable={!hideIssueList}
        onClose={() => setQuery({ isShowIssues: false })}
        visible={!cropping && isShowIssues}
        getContainer={false}
        style={{ position: "absolute" }}
      >
        <IssueList
          title={
            <Button
              ghost
              type="primary"
              style={{ width: 296, marginBottom: 8 }}
              onClick={() => {
                setState(
                  produce(state, (draft) => {
                    draft.croppedDataURL = null;
                    draft.cropping = false;
                  }),
                );

                setQuery({ newModalVisible: true, fromNewButton: true });
              }}
            >
              <PlusOutlined /> 新建问题
            </Button>
          }
          setSolvingCount={(count) =>
            update((draft) => {
              draft.solvingCount = count;
            })
          }
          style={{ flex: "auto", overflow: "hidden" }}
          refreshTag={refreshTag}
          // unitIds={unitIds}
          isShowMark={isShowIssues}
          view3d={view3d}
        />
      </Drawer>
      <IssueDetailMini
        view3d={view3d}
        closable={!hideIssueList}
        refresh={refreshIssueList}
        visible={isShowIssues && !cropping && !!activeIssueId}
        onClose={() => {
          refreshIssueList();
          setQuery({ activeIssueId: undefined });
        }}
      />
      <NewIssueModal
        workUnits={workUnits}
        onScreenshot={() => {
          setState(
            produce(state, (draft) => {
              draft.cropping = true;
            }),
          );
        }}
        element={element}
        croppedDataURL={state.croppedDataURL || undefined}
        visible={!cropping && isShowIssues && newModalVisible}
        fromNewButton={fromNewButton}
        onCommit={commitNewIssue}
        onClose={() => {
          setState(
            produce(state, (draft) => {
              draft.croppedDataURL = null;
              draft.cropping = false;
            }),
          );
          setQuery({ newModalVisible: false, fromNewButton: false });
        }}
      />
    </div>
  );
};
export default IssueView;
