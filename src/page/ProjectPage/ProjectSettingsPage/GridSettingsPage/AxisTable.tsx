import React, { useEffect } from "react";
import { Switch, Route, useRouteMatch } from "react-router";
import { ProjectParams } from "model/route-params.model";
import { Link } from "react-router-dom";
import { useImmer } from "use-immer";
import { Table, Button } from "component/Antd";
import { Tooltip , InputNumber } from "antd";
import {
  VerticalAlignTopOutlined,
  VerticalAlignBottomOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

import { InstanceAxis } from "function/grid.func";

import NumberEditor from "component/NumberEditor";
import { AxisGridCustomized } from "three-engine/bim/model/objects/axisgridcustomized";
import Iconfont from "component/Iconfont";

interface AxisTableProps {
  editMode: boolean;
  data: InstanceAxis[];
  type: "_X" | "_Y";
  refresh: () => void;
}

interface State {
  axes: InstanceAxis[];
  newDist: number;
  newNum: number;
}

const defaultDist = 8400;

export default function AxisTable(props: AxisTableProps) {
  const { editMode, data, type, refresh } = props;
  const [{ axes, newDist, newNum }, updateState] = useImmer<State>({
    axes: [],
    newDist: defaultDist,
    newNum: 1,
  });
  const {
    url,
    path,
    params: { projectId },
  } = useRouteMatch<ProjectParams>();

  useEffect(() => {
    updateState((draft) => void (draft.axes = data));
  }, [data]);

  const addToEnd = () => {
    if (newDist <= 0) {
      alert("错误！轴间距应为正！");
      return;
    }

    if (newNum <= 0) {
      alert("错误！个数应为正！");
      return;
    }

    const p = AxisGridCustomized.instance()!;
    let lastPointer;
    if (data.length > 0) {
      lastPointer = data[0].pointer;
    } else {
      lastPointer = type == "_X" ? p._X : p._Y;
    }

    let pointer = lastPointer;

    for (let i = 0; i < newNum; i++) {
      pointer = p.add(newDist, 1, pointer, true, type == "_X");
    }

    refresh();
  };

  const toNumber = (val: string | number | undefined): number => {
    if (val === undefined) return 0;
    return typeof val === "string" ? parseFloat(val) || 0 : val;
  };

  const columns_readonly = [
    {
      title: "轴间距(mm)",
      dataIndex: "dist",
      width: 90,
    },
    {
      title: "个数",
      dataIndex: "num",
      width: 60,
      editable: true,
    },
  ];

  const columns = [
    {
      title: "轴号",
      dataIndex: "name",
      width: 50,
    },
    {
      title: type == "_X" ? "与下条轴间距" : "与左条轴间距",
      dataIndex: "dist",
      width: 90,
      render: (val: number, record: InstanceAxis, index: number) => {
        if (index === data.length - 1) {
          return "-";
        }

        return (
          <NumberEditor
            value={val}
            step={100}
            onChange={(val) => {
              updateState((draft) => void (draft.axes[index].dist = val));
            }}
            onBlur={(val) => {
              if (axes[index].dist > 0) {
                const p = AxisGridCustomized.instance()!;
                p.modify(record.pointer, axes[index].dist, axes[index].num);
                refresh();
              } else {
                alert("错误！轴间距应为正！");
                refresh();
              }
            }}
          />
        );
      },
    },
    // {
    //   title: "个数",
    //   dataIndex: "num",
    //   width: 70,
    //   render: (val: number, record: InstanceAxis, index: number) => {
    //     return (
    //       <NumberEditor
    //         value={val}
    //         onChange={(val) =>
    //           updateState((draft) => {
    //             draft.axes[index].num = toNumber(val);
    //           })
    //         }
    //         onBlur={() => {
    //           if (axes[index].num) {
    //             let p = AxisGridCustomized.instance()!;
    //             p.modify(record.pointer, axes[index].dist, axes[index].num);
    //           } else {
    //             alert("错误！个数应为正！");
    //             refresh();
    //           }
    //         }}
    //       />
    //     );
    //   },
    // },
    {
      title: "操作",
      dataIndex: "operation",
      width: 80,
      render: (a: any, record: InstanceAxis, index: number) => (
          <div className="action-icons">
            <div
              onClick={() => {
                const p = AxisGridCustomized.instance()!;
                p.add(
                  record.dist || defaultDist,
                  1,
                  record.pointer,
                  true,
                  type == "_X",
                );
                refresh();
              }}
            >
              <Tooltip
                trigger="hover"
                mouseEnterDelay={0.5}
                placement="bottom"
                title="向上方插入行"
              >
                <Iconfont type="icon-biaogecaozuo-shangzengyihang" />
              </Tooltip>
            </div>
            {index < data.length - 1 && (
              <div
                onClick={() => {
                  const p = AxisGridCustomized.instance()!;
                  p.add(
                    record.dist || defaultDist,
                    1,
                    record.pointer,
                    false,
                    type == "_X",
                  );
                  refresh();
                }}
              >
                <Tooltip
                  trigger="hover"
                  mouseEnterDelay={0.5}
                  placement="bottom"
                  title="向下方插入行"
                >
                  <Iconfont type="icon-biaogecaozuo-xiazengyihang" />
                </Tooltip>
              </div>
            )}
            {index < data.length - 1 && (
              <div
                style={{ marginRight: 12 }}
                onClick={() => {
                  const p = AxisGridCustomized.instance()!;
                  p.del(record.pointer, type == "_X");
                  refresh();
                }}
              >
                <Tooltip
                  trigger="hover"
                  mouseEnterDelay={0.5}
                  placement="bottom"
                  title="删除"
                >
                  <Iconfont type="icon-biaogecaozuo-shanchuhang" />
                </Tooltip>
              </div>
            )}
          </div>
        ),
    },
  ];

  return (
    <>
      {editMode && (
        <div className="axis-action">
          <NumberEditor
            label="轴间距"
            value={newDist}
            step={100}
            width={100}
            addonAfter="mm"
            onChange={(val) =>
              updateState((draft) => void (draft.newDist = toNumber(val)))
            }
          />

          <NumberEditor
            label="个数"
            value={newNum}
            width={50}
            onChange={(val) =>
              updateState((draft) => void (draft.newNum = toNumber(val)))
            }
          />

          <Button size="small" onClick={addToEnd}>
            增加
          </Button>
        </div>
      )}
      <div>
        <Table
          dataSource={axes}
          columns={editMode ? columns : columns_readonly}
          // rowClassName="editable-row"
          pagination={false}
        />
      </div>
    </>
  );
}
