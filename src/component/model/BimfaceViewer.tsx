import { useSize } from "@umijs/hooks";
import { Tag } from "antd";
import CropLayer from "component/Drawer/CropLayer";
import { uuidv4 } from "function/string.func";
import produce from "immer";
import Konva from "konva";
import { first, isArray } from "lodash";
import React, {
  forwardRef,
  ForwardRefRenderFunction,
  MutableRefObject,
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";
import { useRecoilState } from "recoil";
import { BimfaceService } from "service/bimface.service";
import cropImageState from "state/crop-image.state";
import { useImmer } from "use-immer";

declare const Glodon: any;
export interface BimfaceViewerProps {
  label?: string;
  viewTokens: string | string[];
  waitingForLoad?: boolean;
  modelFormat: "dwg" | string;
  showModelTree?: boolean;
  cameraAnimation?: boolean;
  width?: number;
  height?: number;
  // 用于状态同步
  onStateChange?: (state: any) => void;
  // 用于识别对比时，当前的主动联动方
  onFocus?: () => void;
  // 用于多个实例排队初始化
  onLoaded?: () => void;
  onViewAdded?: (viewToken: string) => void;
  onViewerCreated?: (app: any, viewer: any) => void;
}

export interface State {
  domId: string;
  initialized: boolean;
  croppedCanvas?: any;
}

export interface Viewer {}

export default forwardRef<Viewer, BimfaceViewerProps>(function BimfaceViewer(
  props: BimfaceViewerProps,
  ref: MutableRefObject<Viewer | null>,
) {
  const appRef = useRef<any>(null);
  const viewerRef = useRef<any>(null);
  const [state, setState] = useRecoilState(cropImageState);
  const [canvasSize, canvasSizeRef] = useSize<HTMLDivElement>();
  const {
    label,
    viewTokens,
    cameraAnimation,
    modelFormat: format,
    waitingForLoad: waiting,
    width,
    height,
    onLoaded,
    onViewerCreated,
    onStateChange,
    onFocus,
    onViewAdded,
  } = props;
  const initViewToken = first(viewTokens);
  const [{ domId, initialized }, updateState] = useImmer<State>({
    domId: uuidv4(),
    initialized: false,
  });

  const is3D = !["dwg"].includes(format);

  function onBimfaceViewerCreated(app: any, viewer: any) {
    appRef.current = app;
    viewerRef.current = viewer;
    if (ref) {
      ref.current = viewer;
    }
    onViewerCreated && onViewerCreated(app, viewer);
    updateState((draft) => {
      draft.initialized = true;
    });
  }

  const serviceRef = useRef<BimfaceService>(
    new BimfaceService(
      { domId, format, viewTokens, cameraAnimation },
      onBimfaceViewerCreated,
      onLoaded,
      onViewAdded,
    ),
  );

  // #region 处理状态改变同步
  function handleStateChange() {
    onStateChange && onStateChange(viewerRef.current.getCurrentState());
  }

  useEffect(() => {
    viewerRef.current &&
      viewerRef.current.addEventListener("Rendered", handleStateChange);
    return () => {
      viewerRef.current &&
        viewerRef.current.removeEventListener("Rendered", handleStateChange);
    };
  }, [viewerRef, onStateChange]);
  // #endregion

  // #region 处理初始化或 token 变化
  useLayoutEffect(() => {
    // 加入等待中或者缺少有效 token 则忽略初始化
    if (waiting || !initViewToken) return;

    // 只应该初始化一次
    if (!initialized) {
      serviceRef.current.init();
    }
  }, [format, waiting, initViewToken]);

  useEffect(() => {
    if (appRef.current && initialized) {
      // 非初始化，直接添加全部 token
      const tokens = isArray(viewTokens) ? viewTokens : [viewTokens];

      let index = 0;
      const addView = () => {
        index++;

        if (index < tokens.length) {
          appRef.current.addView(tokens[index], null, []);
        } else {
          onViewAdded && onViewAdded(tokens.toString());
          const modelTree = appRef.current.getToolbar("ModelTree");
          if (modelTree) {
            modelTree.hide();
          }
        }
      };
      if (is3D) {
        viewerRef.current.addEventListener(
          Glodon.Bimface.Viewer.Viewer3DEvent.ViewAdded,
          addView,
        );
        viewerRef.current.addEventListener(
          Glodon.Bimface.Viewer.Viewer3DEvent.ViewChanged,
          addView,
        );
        appRef.current.addView(tokens[index]);
      }
    }

    return () => {
      if (appRef.current && initialized) {
        const tokens = isArray(viewTokens) ? viewTokens : [viewTokens];
        tokens.forEach((viewToken) => {
          viewerRef.current.removeView(viewToken);
        });
      }
    };
  }, [initialized, viewTokens?.toString()]);
  // #endregion

  useEffect(() => () => {
      if (appRef.current) {
        try {
          appRef.current.destroy();
        } catch (e) {}
      }
    }, []);

  if (!initViewToken) {
    return <Tag color="red">View Token 为空</Tag>;
  }

  return (
    <div
      ref={canvasSizeRef}
      className="bimface-viewer"
      onMouseDown={() => {
        onFocus && onFocus();
      }}
    >
      <div
        id={domId}
        style={{ width: width ?? "100%", height: height ?? "100%" }}
       />
      {state.cropping && (
        <CropLayer
          width={canvasSize.width ?? window.innerWidth}
          height={canvasSize.height ?? window.innerHeight - 100}
          onCrop={({ startX, startY, endX, endY }, layerDataURL) => {
            viewerRef.current?.createSnapshotAsync(
              new Glodon.Web.Graphics.Color(223, 236, 245, 1),
              (data: any) => {
                const stage = new Konva.Stage({
                  container: document.createElement("div"),
                  width: endX - startX,
                  height: endY - startY,
                });

                Konva.Image.fromURL(data, (img: Konva.Image) => {
                  const imageLayer = new Konva.Layer();
                  stage.add(imageLayer);
                  const cropped = img.toDataURL({
                    x: startX,
                    y: startY,
                    width: endX - startX,
                    height: endY - startY,
                  });

                  Konva.Image.fromURL(cropped, (img: Konva.Image) => {
                    imageLayer.add(img);

                    Konva.Image.fromURL(layerDataURL, (img: Konva.Image) => {
                      imageLayer.add(img);
                      imageLayer.batchDraw();
                      const dataURL = stage.toDataURL({ pixelRatio: 2 });
                      setState(
                        produce(state, (draft) => {
                          draft.croppedDataURL = dataURL;
                          draft.cropping = false;
                        }),
                      );
                    });
                  });
                });
              },
            );
          }}
        />
      )}
    </div>
  );
} as ForwardRefRenderFunction<Viewer, BimfaceViewerProps>);
