import { Drawer } from "antd";
import { DataSetVO } from "api/generated/model";
import { defaultDrawerSettings } from "consts";
import React from "react";
import { useImmer } from "use-immer";
import WorkUnitForm from "./WorkUnitForm";

export interface AddWorkUnitDrawerProps {
  teamId?: string | null;
  visible: boolean;
  editMode?: boolean;
  workUnitId?: string;
  onClose: () => void;
  onComplete: () => void;
}

export interface State {
  workUnit: DataSetVO | null;
}

export default function AddWorkUnitDrawer(props: AddWorkUnitDrawerProps) {
  const { teamId, visible, workUnitId, editMode, onClose, onComplete } = props;
  const [{ workUnit }, updateState] = useImmer<State>({
    workUnit: null,
  });

  const title = editMode ? "编辑工作单元" : "添加工作单元";
  const drawerSettings = editMode ? {} : defaultDrawerSettings;
  return (
    <>
      <Drawer
        title={title}
        visible={visible}
        onClose={onClose}
        width={480}
        {...drawerSettings}
      >
        {visible && (
          <WorkUnitForm
            teamId={teamId}
            editMode={editMode}
            workUnitId={workUnitId}
            onComplete={onComplete}
            onClose={onClose}
          />
        )}
      </Drawer>
    </>
  );
}
