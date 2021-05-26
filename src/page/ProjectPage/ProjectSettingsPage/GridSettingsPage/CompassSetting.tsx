import React, { useEffect } from "react";
import { Switch, Route, useRouteMatch } from "react-router";
import { ProjectParams } from "model/route-params.model";
import { Link } from "react-router-dom";
import { useImmer } from "use-immer";
import consts from "consts";
import NumberEditor from "component/NumberEditor";
import { Select, SelectOption, Input } from "component/Antd";
import { GridAngle } from "function/grid.func";
import { Project } from "three-engine/core/extension/jsmodeler";

const { PUBLIC_URL } = consts;
export enum Direction {
  DueNorth = 0,
  ProjectNorth = 1,
}

interface CompassSettingProps {
  editMode: boolean;
}

interface State {
  angle: number;
  direction: Direction;
  refresh: number;
}

export default function CompassSetting(props: CompassSettingProps) {
  const { editMode } = props;
  const [{ angle, direction, refresh }, updateState] = useImmer<State>({
    angle: 0,
    direction: Direction.DueNorth,
    refresh: 0,
  });
  const {
    url,
    path,
    params: { projectId },
  } = useRouteMatch<ProjectParams>();

  useEffect(() => {
    if (editMode) {
      updateState((draft) => void (draft.direction = Direction.ProjectNorth));
    } else {
      updateState((draft) => void (draft.direction = Direction.DueNorth));
    }
  }, [editMode]);

  useEffect(() => {
    updateState((draft) => void (draft.angle = GridAngle.value));
  }, []);

  const submitAngle = (val: number) => {
    GridAngle.setVal(angle);
    updateState((draft) => void draft.refresh++);
  };

  const getCurrentAngle = () => {
    if (direction === Direction.ProjectNorth) {
      return GridAngle.value;
    }

    return 0;
  };

  return (
    <div className="canvas-compass">
      <img src={`${PUBLIC_URL}/compass.png`} />
    </div>
  );

  // return (
  //   <div className="compass-area">
  //     <div className="canvas-compass">
  //       <img
  //         src={`${PUBLIC_URL}/compass.png`}
  //         style={{ transform: `rotate(${getCurrentAngle()}deg)` }}
  //       />
  //       {editMode === true && (
  //         <img
  //           src={`${PUBLIC_URL}/compass-overlay.png`}
  //           style={{ position: "absolute", left: 0 }}
  //         />
  //       )}
  //     </div>
  //     <div className="compass-angle">
  //       <Select
  //         value={direction}
  //         disabled={editMode}
  //         onChange={(val) =>
  //           updateState((draft) => void (draft.direction = val))
  //         }
  //       >
  //         <SelectOption value={Direction.DueNorth}>正北</SelectOption>
  //         <SelectOption value={Direction.ProjectNorth}>项目北</SelectOption>
  //       </Select>

  //       {direction == Direction.ProjectNorth && (
  //         <NumberEditor
  //           step={0.01}
  //           value={angle}
  //           onChange={(val) => {
  //             updateState((draft) => void (draft.angle = val));
  //           }}
  //           addonAfter="°"
  //           onBlur={submitAngle}
  //           disabled={!editMode}
  //         />
  //       )}
  //     </div>
  //   </div>
  // );
}
