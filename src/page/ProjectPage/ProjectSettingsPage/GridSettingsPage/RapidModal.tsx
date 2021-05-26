import React, { useEffect } from "react";
import { Button, Tooltip, Modal } from "antd";
import { Switch, Route, useRouteMatch } from "react-router";
import { ProjectParams } from "model/route-params.model";
import { Link } from "react-router-dom";
import { useImmer } from "use-immer";
import Loading from "component/Loading";
import { Application } from "three-engine/core/application";
import { AxisGridCustomized } from "three-engine/bim/model/objects/axisgridcustomized";
import { toUIAxisData, AxisGridData } from "function/grid.func";
import actionManager from "three-engine/core/actions/actionmanager";
import { InsertAxisGridCommand } from "commands/insertaxisgridcommand";
import { publishEvent } from "function/stats.func";
import AxisTable from "./AxisTable";
import RapidGridCanvas from "./RapidGridCanvas";

interface RapidModalProps {
  showModal: boolean;
  onCancel: () => void;
}

interface State {
  data: AxisGridData | null;
  insertAfterClose: boolean;
}

export default function RapidModal(props: RapidModalProps) {
  const { showModal, onCancel } = props;
  const [{ data, insertAfterClose }, updateState] = useImmer<State>({
    data: null,
    insertAfterClose: false,
  });
  const {
    url,
    path,
    params: { projectId },
  } = useRouteMatch<ProjectParams>();

  const getData = () => {
    const p = AxisGridCustomized.instance();

    if (p) {
      const newData = toUIAxisData(p);
      updateState((draft) => {
        draft.data = newData;
      });
    }
  };
  const loadRapidData = () => {
    actionManager.processCommand(
      new InsertAxisGridCommand(AxisGridCustomized.instance(), {
        clientX: 0,
        clientY: 0,
      }),
    );
  };
  useEffect(() => {
    if (showModal === true) {
      updateState((draft) => {
        draft.insertAfterClose = false;
      });
    } else if (insertAfterClose) {
      loadRapidData();
    }
  }, [showModal]);

  return (
    <Modal
      okText="插入到画布"
      destroyOnClose
      maskClosable={false}
      title="快速绘制轴网"
      wrapClassName="rapid-grid-modal"
      onCancel={onCancel}
      visible={showModal}
      onOk={(e) => {
        onCancel();
        updateState((draft) => {
          draft.insertAfterClose = true;
        });
      }}
    >
      {!data ? (
        <div className="sider">
          <Loading />
        </div>
      ) : (
        <div className="sider">
          <div className="grid-info">
            <div className="axis-info">
              <div className="axis-title">横向轴：</div>
              <div className="axis-depth">总进深：{data?.sumX} mm</div>

              <AxisTable
                editMode
                data={data.arrX}
                type="_X"
                refresh={getData}
              />
            </div>
            <div className="axis-info">
              <div className="axis-title">纵向轴：</div>
              <div className="axis-depth">总开间：{data?.sumY} mm</div>
              <AxisTable
                editMode
                data={data.arrY}
                type="_Y"
                refresh={getData}
              />
            </div>
          </div>
        </div>
      )}
      <RapidGridCanvas onDataLoad={() => getData()} />
    </Modal>
  );
}
