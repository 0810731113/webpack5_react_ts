import Loading from "component/Loading";
import useLoading from "hook/use-loading.hook";
import React, { useCallback, useRef, useEffect, useLayoutEffect } from "react";
import { workUnitService, versionService } from "service";
import { useImmer } from "use-immer";
import BimfaceViewer from "./BimfaceViewer";

export interface WorkUnitModelComparisonViewProps {
  format: string;
  leftVersionId: number | null;
  rightVersionId: number | null;
  checkedElements?: { bfId: React.ReactText; color: string }[];
  selectedElementIds?: React.ReactText[];
  leftActions?: React.ReactNode | React.ReactNode[];
  rightActions?: React.ReactNode | React.ReactNode[];
}

export interface State {
  leftLoaded: boolean;
  leftDriven: boolean;
  leftViewAdded: boolean;
  rightViewAdded: boolean;
}

declare const Glodon: any;

export default function WorkUnitModelComparisonView(
  props: WorkUnitModelComparisonViewProps,
) {
  const {
    leftVersionId,
    rightVersionId,
    format,
    checkedElements,
    selectedElementIds,
    leftActions,
    rightActions,
  } = props;
  const leftRef = useRef<any>(null);
  const rightRef = useRef<any>(null);
  const [
    { leftLoaded, leftDriven, leftViewAdded, rightViewAdded },
    updateState,
  ] = useImmer<State>({
    leftLoaded: false,
    leftDriven: false,
    leftViewAdded: false,
    rightViewAdded: false,
  });
  useEffect(() => {
    updateState((draft) => {
      draft.leftViewAdded = false;
    });
  }, [leftVersionId]);
  useEffect(() => {
    updateState((draft) => {
      draft.rightViewAdded = false;
    });
  }, [rightVersionId]);
  useLayoutEffect(() => {
    // 恢复所有构件
    if (!!rightRef.current && !!leftRef.current) {
      rightRef.current?.restoreAllDefault();
      leftRef.current?.restoreAllDefault();
    }
    if (
      leftViewAdded &&
      rightViewAdded &&
      checkedElements?.length &&
      rightRef.current &&
      leftRef.current
    ) {
      const selectedBfIds = checkedElements.map((element) => element.bfId);
      // rightRef.current.setSelectedComponentsById(selectedBfIds);
      // rightRef.current.zoomToSelectedComponents();
      // leftRef.current.setSelectedComponentsById(selectedBfIds);
      // leftRef.current.zoomToSelectedComponents();
      // 调用instance(bimface instance)提供的功能实现需求

      checkedElements.forEach((element) => {
        const appliedColor = new Glodon.Web.Graphics.Color(element.color, 0.8);
        rightRef.current.overrideComponentsColorById(
          [element.bfId],
          appliedColor,
        );
        leftRef.current.overrideComponentsColorById(
          [element.bfId],
          appliedColor,
        );
      });
      // 对构件着色

      // 隔离指定构件，其他构件透明
      const state = Glodon.Bimface.Viewer.IsolateOption.MakeOthersTranslucent;
      rightRef.current.isolateComponentsById(selectedBfIds, state);
      leftRef.current.isolateComponentsById(selectedBfIds, state);

      // 渲染一次
    }
    rightRef.current?.render();
    leftRef.current?.render();
  }, [
    checkedElements,
    rightRef.current,
    leftRef.current,
    leftViewAdded,
    rightViewAdded,
  ]);
  useEffect(() => {
    if (
      leftViewAdded &&
      rightViewAdded &&
      rightRef.current &&
      leftRef.current
    ) {
      rightRef.current.setSelectedComponentsById(selectedElementIds);

      leftRef.current.setSelectedComponentsById(selectedElementIds);

      if (leftRef.current.getSelectedComponents()?.length) {
        updateState((draft) => {
          draft.leftDriven = true;
        });
        setTimeout(() => {
          leftRef.current.zoomToSelectedComponents();
          const leftState = leftRef.current.getCurrentState();
          rightRef.current.setState(leftState);
          rightRef.current
            .getViewer()
            .camera.up.copy(leftRef.current.getViewer().camera.up);
        });
      } else {
        updateState((draft) => {
          draft.leftDriven = false;
        });
        setTimeout(() => {
          rightRef.current.zoomToSelectedComponents();
          const rightState = rightRef.current.getCurrentState();
          leftRef.current.setState(rightState);
          leftRef.current
            .getViewer()
            .camera.up.copy(rightRef.current.getViewer().camera.up);
        });
      }
    }
  }, [
    selectedElementIds,
    rightRef.current,
    leftRef.current,
    leftViewAdded,
    rightViewAdded,
  ]);

  function loadViewToken(versionId: number | null) {
    if (versionId !== null) {
      return versionService
        .loadVersionViewToken(versionId)
        .then((result) => result.token);
    }
    return Promise.resolve(null);
  }

  const leftLoader = useCallback(() => loadViewToken(leftVersionId), [
    leftVersionId,
  ]);
  const rightLoader = useCallback(() => loadViewToken(rightVersionId), [
    rightVersionId,
  ]);

  const { loading: loadingLeft, data: leftToken } = useLoading<string | null>(
    leftLoader,
  );
  const { loading: loadingRight, data: rightToken } = useLoading<string | null>(
    rightLoader,
  );

  function onLeftLoaded() {
    updateState((draft) => {
      draft.leftLoaded = true;
    });
  }

  if (leftToken === null || rightToken === null) {
    return <Loading />;
  }

  return (
    <div style={{ display: "flex", flex: "auto" }}>
      <div className="left">
        <BimfaceViewer
          ref={leftRef}
          label="left"
          viewTokens={leftToken}
          modelFormat={format}
          onLoaded={onLeftLoaded}
          onViewAdded={() => {
            updateState((draft) => {
              draft.leftViewAdded = true;
            });
          }}
          onFocus={() => {
            updateState((draft) => {
              draft.leftDriven = true;
            });
          }}
          onStateChange={(state) => {
            if (leftDriven && rightRef.current && state) {
              rightRef.current.setState(state);
              rightRef.current
                .getViewer()
                .camera.up.copy(leftRef.current.getViewer().camera.up);
            }
          }}
        />
        <span className="actions">{leftActions}</span>
      </div>
      <div className="right">
        <BimfaceViewer
          ref={rightRef}
          label="right"
          waitingForLoad={!leftLoaded}
          viewTokens={rightToken}
          modelFormat={format}
          onViewAdded={() => {
            updateState((draft) => {
              draft.rightViewAdded = true;
            });
          }}
          onFocus={() => {
            updateState((draft) => {
              draft.leftDriven = false;
            });
          }}
          onStateChange={(state) => {
            if (!leftDriven && leftRef.current && state) {
              leftRef.current.setState(state);
              leftRef.current
                .getViewer()
                .camera.up.copy(rightRef.current.getViewer().camera.up);
            }
          }}
        />
        <span className="actions">{rightActions}</span>
      </div>
    </div>
  );
}
