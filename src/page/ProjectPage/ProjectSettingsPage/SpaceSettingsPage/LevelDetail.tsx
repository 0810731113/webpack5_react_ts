import React, { useEffect } from "react";
import { Switch, Route, useRouteMatch } from "react-router";
import { ProjectParams } from "model/route-params.model";
import { Link } from "react-router-dom";
import { useImmer } from "use-immer";
import { SpaceTreeNode } from "service/space-settings.service";
import { Store } from "rc-field-form/lib/interface";
import { Button, Form, Table, Input, InputNumber, Tooltip } from "antd";

import {
  InstanceLevel,
  toLevelData,
  InstanceLevelName,
  calcLevel,
  deserialize,
  addLowerLevel,
  addUpperLevel,
  deleteLevel,
  batchAddUpperLevel,
} from "function/level.func";
import Iconfont from "component/Iconfont";
import NumberEditor from "../../../../component/NumberEditor";

interface LevelDetailProps {
  editMode: boolean;
  floors: SpaceTreeNode[];
  onSave: (floors: SpaceTreeNode[]) => void;
}

interface State {
  data: InstanceLevel[];
  refresh: number;
  count: number;
  newFloorCount: number;
  newFloorHeight: number;
  newFloorThicknes: number;
}

export default function LevelDetail(props: LevelDetailProps) {
  const { editMode, floors, onSave } = props;
  const [
    { data, refresh, count, newFloorCount, newFloorHeight, newFloorThicknes },
    updateState,
  ] = useImmer<State>({
    data: [],
    refresh: 0,
    newFloorCount: 1,
    newFloorHeight: 3,
    newFloorThicknes: 50,
    count: 0,
  });
  const {
    url,
    path,
    params: { projectId },
  } = useRouteMatch<ProjectParams>();

  const [form] = Form.useForm();

  useEffect(() => {
    updateState((draft) => void (draft.data = toLevelData(floors)));
  }, [floors]);

  useEffect(() => {
    if (refresh > 0) {
      onSave(deserialize(data));
    }
  }, [refresh]);

  const batchAdd = () => {
    if (newFloorCount <= 0) {
      alert("错误！新增楼层数应为正！");
      return;
    }

    if (newFloorHeight < 0) {
      alert("错误！楼层高度为负！");
      return;
    }

    if (newFloorThicknes < 0) {
      alert("错误！面层厚度为负！");
      return;
    }

    updateState((draft) => {
      draft.refresh++;
      batchAddUpperLevel(
        draft.data,
        newFloorHeight,
        newFloorThicknes,
        newFloorCount,
        draft.count,
      );
      draft.count += newFloorCount;
    });
  };

  const columns_readonly = [
    {
      title: "建筑名称",
      dataIndex: "name",
      width: "15%",
      render: (name: string) => `建筑${name}`,
    },
    {
      title: "建筑标高(m)",
      dataIndex: "arcLevel",
      width: "15%",
      editable: true,
      render: (val: number) => val.toFixed(3),
    },
    {
      title: "楼层高度(m)",
      dataIndex: "floorHeight",
      width: "15%",
      editable: true,
      render: (val: number, record: InstanceLevel, index: number) =>
        index === data.length - 1 ? "-" : val.toFixed(3),
    },
    {
      title: "结构名称",
      dataIndex: "name",
      width: "15%",
      editable: true,
      render: (name: string) => `结构${name}`,
    },
    {
      title: "面层厚度(mm)",
      dataIndex: "floorThickness",
      width: "15%",
      editable: true,
    },
    {
      title: "结构标高(m)",
      dataIndex: "strucLevel",
      width: "15%",
      editable: true,
      render: (val: number) => val.toFixed(3),
    },
  ];

  const columns = [
    {
      title: "建筑名称",
      dataIndex: "name",
      width: "15%",
      editable: true,
      render: (name: string, record: InstanceLevel, index: number) => (
        <Input
          addonBefore="建筑"
          value={name}
          onChange={(e) => {
            updateState(
              (draft) => void (draft.data[index].name = e.target.value.trim()),
            );
            e.persist();
          }}
          onBlur={(e) => updateState((draft) => void draft.refresh++)}
        />
      ),
    },
    {
      title: "建筑标高(m)",
      dataIndex: "arcLevel",
      width: "15%",
      editable: true,
      render: (val: number, record: InstanceLevel, index: number) => (
        <NumberEditor
          value={val}
          step={0.01}
          precision={3}
          onChange={(val) =>
            updateState((draft) => {
              draft.data[index].arcLevel = val;
            })
          }
          onBlur={() =>
            updateState((draft) => {
              calcLevel(draft.data, index, "arcLevel", val);
              draft.refresh++;
            })
          }
        />
      ),
    },
    {
      title: "楼层高度(m)",
      dataIndex: "floorHeight",
      width: "15%",
      editable: true,
      render: (val: number, record: InstanceLevel, index: number) => {
        if (index === data.length - 1) {
          return "-";
          // return val.toFixed(3);
        }
        return (
          <NumberEditor
            value={val}
            step={0.01}
            precision={3}
            onChange={(val) =>
              updateState((draft) => {
                draft.data[index].floorHeight = val;
              })
            }
            onBlur={() => {
              updateState((draft) => {
                calcLevel(draft.data, index, "floorHeight", val);
                draft.refresh++;
              });
            }}
          />
        );
      },
    },
    {
      title: "结构名称",
      dataIndex: "name",
      width: "15%",
      editable: true,
      render: (name: string, record: InstanceLevel, index: number) => (
        <Input
          addonBefore="结构"
          value={name}
          onChange={(e) => {
            updateState(
              (draft) => void (draft.data[index].name = e.target.value.trim()),
            );
            e.persist();
          }}
          onBlur={(e) => void updateState((draft) => void draft.refresh++)}
        />
      ),
    },
    {
      title: "面层厚度(mm)",
      dataIndex: "floorThickness",
      width: "15%",
      editable: true,
      render: (val: number, record: InstanceLevel, index: number) => (
        <NumberEditor
          value={val}
          step={50}
          onChange={(val) =>
            updateState((draft) => {
              draft.data[index].floorThickness = val;
            })
          }
          onBlur={() =>
            updateState((draft) => {
              calcLevel(draft.data, index, "floorThickness", val);
              draft.refresh++;
            })
          }
        />
      ),
    },
    {
      title: "结构标高(m)",
      dataIndex: "strucLevel",
      width: "15%",
      editable: true,
      render: (strucLevel: number, record: InstanceLevel, index: number) => (
        <NumberEditor
          value={strucLevel}
          step={0.01}
          precision={3}
          onChange={(val) =>
            updateState((draft) => {
              draft.data[index].strucLevel = val;
            })
          }
          onBlur={(e) =>
            updateState((draft) => {
              calcLevel(draft.data, index, "strucLevel", strucLevel);
              draft.refresh++;
            })
          }
        />
      ),
    },
    {
      title: "操作",
      dataIndex: "operation",
      render: (a: any, record: InstanceLevel, index: number) => (
        <div>
          <Tooltip
            trigger="hover"
            mouseEnterDelay={0.5}
            placement="bottom"
            title="向上方插入行"
          >
            <a
              onClick={() =>
                updateState((draft) => {
                  draft.count++;
                  draft.refresh++;
                  addLowerLevel(draft.data, index, draft.count);
                })
              }
            >
              <Iconfont
                type="icon-biaogecaozuo-shangzengyihang"
                style={{ fontSize: 16 }}
              />
            </a>
          </Tooltip>
          &nbsp;&nbsp;
          <Tooltip
            trigger="hover"
            mouseEnterDelay={0.5}
            placement="bottom"
            title="向下方插入行"
          >
            <a
              onClick={() =>
                updateState((draft) => {
                  draft.count++;
                  draft.refresh++;
                  addUpperLevel(draft.data, index, draft.count);
                })
              }
            >
              <Iconfont
                type="icon-biaogecaozuo-xiazengyihang"
                style={{ fontSize: 16 }}
              />
            </a>
          </Tooltip>
          &nbsp;&nbsp;
          {data.length > 1 && (
            <a
              onClick={() =>
                updateState((draft) => {
                  draft.refresh++;
                  deleteLevel(draft.data, index);
                })
              }
            >
              <Iconfont
                type="icon-jietugongjulan-shanchu"
                style={{ fontSize: 16 }}
              />
            </a>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="level-detail">
      <div className="title">标高：</div>

      {editMode && (
        <div className="actions">
          <div className="action-name">批量操作: </div>

          <NumberEditor
            label="新增楼层数"
            value={newFloorCount}
            addonAfter="F"
            width={70}
            onChange={(val) =>
              updateState((draft) => void (draft.newFloorCount = val))
            }
          />

          <NumberEditor
            label="楼层高度"
            value={newFloorHeight}
            step={0.01}
            precision={3}
            addonAfter="m"
            onChange={(val) =>
              updateState((draft) => void (draft.newFloorHeight = val))
            }
          />

          <NumberEditor
            label="面层厚度"
            value={newFloorThicknes}
            addonAfter="mm"
            step={50}
            onChange={(val) =>
              updateState((draft) => void (draft.newFloorThicknes = val))
            }
          />

          <Button size="small" onClick={batchAdd}>
            增加
          </Button>
        </div>
      )}
      <Table
        bordered
        dataSource={data}
        columns={editMode ? columns : columns_readonly}
        // rowClassName="editable-row"
        pagination={false}
      />
    </div>
  );
}
