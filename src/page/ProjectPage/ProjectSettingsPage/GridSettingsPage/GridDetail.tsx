import React, { useEffect } from "react";
import { Switch, Route, useRouteMatch } from "react-router";
import { ProjectParams } from "model/route-params.model";
import { Link } from "react-router-dom";
import { useImmer } from "use-immer";
import { Button, Select } from "component/Antd";
import { AxisGridData, toUIAxisData } from "function/grid.func";
import Loading from "component/Loading";
import { AxisGridCustomized } from "three-engine/bim/model/objects/axisgridcustomized";
import AxisTable from "./AxisTable";

interface GridDetailProps {
  editMode: boolean;
  ready: boolean;
}

interface State {
  data: AxisGridData | null;
}

export default function GridDetail(props: GridDetailProps) {
  const { editMode, ready } = props;
  const [{ data }, updateState] = useImmer<State>({ data: null });
  const {
    url,
    path,
    params: { projectId },
  } = useRouteMatch<ProjectParams>();

  const getData = () => {
    const p = AxisGridCustomized.instance();
    if (p) {
      const data = toUIAxisData(p);
      updateState((draft) => void (draft.data = data));
    }
  };

  useEffect(() => {
    if (ready === true) {
      getData();
    }
  }, [ready]);

  if (!ready || !data) {
    return (
      <div className="sider">
        <Loading />
      </div>
    );
  } 
    return (
      <div className="sider">
        {/* <div style={{ marginBottom: 16 }}>
          <span>轴网类型：正交轴网</span>
        </div> */}
        <div className="grid-info">
          <div className="axis-info">
            <div className="axis-title">横向轴：</div>
            <div className="axis-depth">总进深：{data?.sumX} mm</div>

            <AxisTable
              editMode={editMode}
              data={data.arrX}
              type="_X"
              refresh={getData}
            />
          </div>
          <div className="axis-info">
            <div className="axis-title">纵向轴：</div>
            <div className="axis-depth">总开间：{data?.sumY} mm</div>
            <AxisTable
              editMode={editMode}
              data={data.arrY}
              type="_Y"
              refresh={getData}
            />
          </div>
        </div>
      </div>
    );
  
}
