import React, { useEffect } from "react";
import { Switch, Route, useRouteMatch } from "react-router";
import { ProjectParams } from "model/route-params.model";
import { Link } from "react-router-dom";
import { useImmer } from "use-immer";
import { Button, Tooltip, Modal, message } from "antd";
import Iconfont from "component/Iconfont";
import actionManager from "three-engine/core/actions/actionmanager";
import { CreateAxisLineCommand } from "commands/createaxislinecommand";
import { OffsetAxisLineCommand } from "commands/offsetaxislinecommand";
import { Application } from "three-engine/core/application";
import actionStatus from "three-engine/core/actions/actionstatus";

import RapidModal from "./RapidModal";

enum CommandName {
  OffsetAxisGridCommand = "OffsetAxisGridCommand",
  CreateAxisLineCommand = "CreateAxisLineCommand",
}

interface CanvasToolBarProps {
  editMode: boolean;
}

interface State {
  showModal: boolean;
  activeCommand: CommandName | null;
}

export default function CanvasToolBar(props: CanvasToolBarProps) {
  const { editMode } = props;
  const [{ showModal, activeCommand }, updateState] = useImmer<State>({
    showModal: false,
    activeCommand: null,
  });
  const {
    url,
    path,
    params: { projectId },
  } = useRouteMatch<ProjectParams>();

  useEffect(() => {
    resetCommand();
  }, [editMode]);

  const resetCommand = () => {
    updateState((draft) => void (draft.activeCommand = null));
    actionManager.reset();
  };

  const onCallback = () => {
    const action = actionManager.currentAction;
    if (
      action.status === actionStatus.Cancelled ||
      action.status === actionStatus.Finished
    ) {
      updateState((draft) => void (draft.activeCommand = null));
    }
  };

  const drawGrid = async () => {
    if (activeCommand === CommandName.CreateAxisLineCommand) {
      
    } else {
      updateState(
        (draft) =>
          void (draft.activeCommand = CommandName.CreateAxisLineCommand),
      );
      actionManager.processCommand(
        new CreateAxisLineCommand(() => onCallback()),
      );
      message.warning("点击Esc可以退出轴线绘制");
    }
  };

  const onOffset = async () => {
    if (activeCommand === CommandName.OffsetAxisGridCommand) {
      
    } else {
      const cmd = new OffsetAxisLineCommand(undefined, () => onCallback());
      actionManager.processCommand(cmd);
      updateState(
        (draft) =>
          void (draft.activeCommand = CommandName.OffsetAxisGridCommand),
      );

      message.warning("点击Esc可以退出轴线偏移");
    }
  };

  const fitView = async () => {
    const viewer = Application.instance().viewers.get("grid");
    viewer.fitScreen();
  };

  return (
    <>
      {editMode && (
        <div className="canvas-tool-bar">
          <Tooltip trigger="hover" placement="top" title="绘制轴线">
            <Button
              icon={<Iconfont type="icon-zhouwanggongjulan-huizhizhouxian" />}
              type={
                activeCommand === CommandName.CreateAxisLineCommand
                  ? "primary"
                  : "default"
              }
              onClick={drawGrid}
             />
          </Tooltip>
          <Tooltip trigger="hover" placement="top" title="偏移">
            <Button
              icon={<Iconfont type="icon-zhouwanggongjulan-pianyigongju" />}
              type={
                activeCommand === CommandName.OffsetAxisGridCommand
                  ? "primary"
                  : "default"
              }
              onClick={onOffset}
             />
          </Tooltip>

          <Tooltip trigger="hover" placement="top" title="快速绘制轴网">
            <Button
              icon={<Iconfont type="icon-zhouwanggongjulan-piliang" />}
              onClick={() => {
                resetCommand();
                updateState((draft) => void (draft.showModal = true));
              }}
             />
          </Tooltip>
        </div>
      )}
      <div className="canvas-fit-btn">
        <Tooltip trigger="hover" placement="top" title="重置视角">
          <Iconfont type="icon-zhongzhishijiao" onClick={fitView} />
        </Tooltip>
      </div>

      <RapidModal
        showModal={showModal}
        onCancel={() => updateState((draft) => void (draft.showModal = false))}
      />
    </>
  );
}
