import { Button, Drawer, Popconfirm, Space } from "antd";
import { DataSetVO } from "api/generated/model";
import React, { useEffect } from "react";
import { useImmer } from "use-immer";
import { defaultDrawerSettings } from "consts";
import { useParams } from "react-router";
import { ProjectTeamParams } from "model/route-params.model";
import WorkUnitForm from "./WorkUnitForm";

export interface Props {
  workUnitId: string;
  visible: boolean;
  onClose: (refresh?: boolean) => void;
}

export interface State {
  workUnit: DataSetVO | null;
}

export default function WorkUnitDetailsDrawer(props: Props) {
  const { workUnitId, visible, onClose } = props;
  const [{ workUnit }, updateState] = useImmer<State>({
    workUnit: null,
  });
  const { teamId } = useParams<ProjectTeamParams>();

  if (visible) {
    return (
      <Drawer
        title="工作单元详情"
        visible={visible}
        onClose={() => {
          onClose();
        }}
        width={480}
        {...defaultDrawerSettings}
        destroyOnClose
      >
        <WorkUnitForm
          teamId={teamId}
          editMode
          workUnitId={workUnitId}
          onComplete={() => {
            updateState((draft) => {
              onClose(true);
            });
          }}
          onClose={() => {
            onClose();
          }}
        />
      </Drawer>
    );
  }
  return null;
}
