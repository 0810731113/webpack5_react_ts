import React, { useEffect } from "react";
import { ProjectParams } from "model/route-params.model";
import { useImmer } from "use-immer";
import consts from "consts";
import { Application } from "three-engine/core/application";
import { AxisGridCustomized } from "three-engine/bim/model/objects/axisgridcustomized";
import { Font } from "three-engine/core/model/font";
import { RapidGridViewer2d } from "three-engine/bim/display/2d/rapidgridviewer";
import { useRouteMatch } from "react-router";

const { PUBLIC_URL } = consts;

interface RapidGridCanvasProps {
  onDataLoad: () => void;
}

interface State {}

export default function RapidGridCanvas(
  this: any,
  props: RapidGridCanvasProps,
) {
  const m = { domId: "rapid", view: Application.instance().getActiveView() };
  const { onDataLoad } = props;
  const [{}, updateState] = useImmer<State>({});
  const {
    url,
    path,
    params: { projectId },
  } = useRouteMatch<ProjectParams>();

  useEffect(() => {
    onBegin();
    return () => {
      onEnd();
    };
  }, []);

  const initView = () => {
    const instance = Application.instance();
    if (instance && instance.viewers) {
      let rapidView = instance.viewers.get(m.domId);
      if (!rapidView) {
        Application.instance().viewerManager.register(
          m.domId,
          new RapidGridViewer2d(),
        );
        rapidView = instance.viewers.get(m.domId);
      }
      rapidView.init(m.domId);
      m.view = Application.instance().getActiveView();
      m.view.deactivate();
      rapidView.activate();
      rapidView.suspend = false;
      AxisGridCustomized.load();
      onDataLoad();
    }
  };

  const onBegin = () => {
    window.addEventListener("resize", onResize, false);
    new Font().load();
    Application.instance().viewerManager.suspend = true;
    initView();
    Application.instance().isRunningRapidAxisGrid = true;
  };

  const onEnd = () => {
    window.removeEventListener("resize", onResize, false);

    const instance = Application.instance();
    instance.viewerManager.suspend = false;
    const rapidView = instance.viewers.get(m.domId);
    rapidView.deactivate();
    rapidView.clearAll();
    Application.instance().isRunningRapidAxisGrid = false;
    m.view.activate();
  };

  const onResize = (e: any) => {
    const {viewers} = Application.instance();
    const viewer = viewers.get(m.domId);
    viewer.resize(m.domId);
  };

  return (
    <div id="rapid" className="canvas-container">
      <div className="compass-area">
        <img src={`${PUBLIC_URL}/compass.png`} />
      </div>
    </div>
  );
}
