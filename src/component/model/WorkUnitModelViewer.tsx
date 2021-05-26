import Loading from "component/Loading";
import useLoading from "hook/use-loading.hook";
import React, { useCallback, useRef, useEffect } from "react";
import { Modal } from "antd";
import { workUnitService, versionService, roleService } from "service";
import "./WorkUnitModelViewer.scss";
import { useRecoilState } from "recoil";
import bimfacePageState from "state/bimface.state";
import projectPageState from "state/project.state";
import IssueView from "component/issue/IssueView";
import { withDefault, useQueryParams, BooleanParam } from "use-query-params";
import { ViewTokenResult } from "service/version.service";
import { useImmer } from "use-immer";
import ElementTree from "./ElementTree";
import BimfaceViewer from "./BimfaceViewer";

declare const Glodon: any;

export interface WorkUnitModelViewerProps {
  format: string;
  versionIdList: number[];
}

export interface State {
  viewerCreated: boolean;
}
function getQueryVariable(variable: string) {
  const query = window.location.search.substring(1);
  const vars = query.split("&");
  for (let i = 0; i < vars.length; i++) {
    const pair = vars[i].split("=");
    if (pair[0] === variable) {
      return pair[1];
    }
  }
  return false;
}

export default function WorkUnitModelViewer(props: WorkUnitModelViewerProps) {
  const { format, versionIdList } = props;
  const view3d = useRef(null);
  const [{ viewerCreated }, update] = useImmer<State>({ viewerCreated: false });
  const [{ elementTreeData, versionList }, setState] = useRecoilState(
    bimfacePageState,
  );
  const [{ isShowIssues }, setQuery] = useQueryParams({
    isShowIssues: withDefault(BooleanParam, false),
  });
  const [{}, updateState] = useRecoilState(projectPageState);

  useEffect(() => {
    versionService.getVersionsTree(versionIdList.toString()).then((tree) => {
      const ids: string[] = [];
      setState((pre) => ({
        ...pre,
        elementTreeData: tree,
      }));
    });
    versionService.listVersionsByIds(versionIdList).then((list) => {
      const ids: string[] = [];

      // 判断版本是否被删除
      if (list?.find((ver) => ver.isDelete === 1)) {
        Modal.warning({
          content: "相关版本已被删除，暂不支持定位查看",
          okText: "关闭窗口",
          onOk() {
            window.close();
          },
        });
      }

      if (list?.length) {
        workUnitService.getWorkUnitById(list[0].dataSetId!).then((workunit) => {
          if (workunit?.projectId) {
            roleService
              .getMyResourcesByProjectId(workunit?.projectId)
              .then((ress) => {
                updateState((pre) => ({ ...pre, resources: ress }));
              });
          }
        });
      }

      setState((pre) => ({
        ...pre,
        versionList: list,
      }));
    });
  }, [versionIdList]);
  const versionListLoader = useCallback(
    () =>
      Promise.all(
        versionIdList.map((versionId) =>
          versionService.loadVersionViewToken(versionId),
        ),
      ),
    [versionIdList],
  );
  const { loading, data: viewTokenList } = useLoading<ViewTokenResult[]>(
    versionListLoader,
  );

  if (!viewTokenList || loading) {
    return (
      <div className="work-unit-model-viewer">
        <Loading absolute size={64} />
      </div>
    );
  }
  function onViewerCreated(app: any, view3d: any) {
    if (format !== "dwg") {
      view3d?.addEventListener(
        Glodon.Bimface.Viewer.Viewer3DEvent.ViewAdded,
        (event: any) => {
          const toolbar = app.getToolbar("MainToolbar");
          if (!toolbar.getControl("Issue")) {
            const btnConfig = new Glodon.Bimface.UI.Button.ButtonConfig();
            btnConfig.title = "问题";
            btnConfig.id = "Issue";
            const btn = new Glodon.Bimface.UI.Button.Button(btnConfig);
            btn.setHtml("<button>?</button>");
            btn.addClassName("gld-bf-issue");

            btn.addEventListener("Click", () => {
              setQuery({
                isShowIssues: getQueryVariable("isShowIssues") !== "1",
              });
            });
            toolbar.addControl(btn);
          }
        },
      );
    }
  }
  return (
    <div
      className={`work-unit-model-viewer ${
        isShowIssues ? "is-show-issue" : ""
      }`}
    >
      <BimfaceViewer
        cameraAnimation
        viewTokens={viewTokenList.map((item) => item.token)}
        modelFormat={format}
        ref={view3d}
        onViewerCreated={onViewerCreated}
        onViewAdded={() =>
          update((draft) => {
            draft.viewerCreated = true;
          })
        }
      />
      {format !== "dwg" && (
        <ElementTree
          view3d={view3d}
          fileIdList={viewTokenList.map((item) => item.fileId)}
        />
      )}
      {viewerCreated && view3d && (
        <IssueView
          fileIdList={viewTokenList.map((item) => item.fileId)}
          view3d={view3d}
          versionIdList={versionIdList}
        />
      )}
    </div>
  );
}
