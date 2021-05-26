import { DoubleLeftOutlined, UnorderedListOutlined } from "@ant-design/icons";
import { Collapse, Tooltip, Tree } from "antd";
import { TreeNode } from "api/generated/model";
import { DataNode, EventDataNode } from "rc-tree/lib/interface";
import React, { MutableRefObject, useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import bimfacePageState from "state/bimface.state";

function toTreeDataNode(node: TreeNode, ids: string[]): TreeNode & DataNode {
  let title = node.name;
  if (node.type === "Element") {
    ids.push(node.bfId!);
    title += `(${node.id?.substr(-4, 4)})`;
  }
  return {
    ...node,
    title: <span>{title}</span>,
    key: node.bfId ?? node.id!,
    children: node.items?.map((item) => toTreeDataNode(item, ids)),
  };
}

interface ElementTreeProps {
  fileIdList: string[];
  view3d: MutableRefObject<any | null>;
}

const ElementTree = (props: ElementTreeProps) => {
  const { view3d, fileIdList } = props;
  const [activeKey, setActiveKey] = useState("");
  const [data, setData] = useState<DataNode[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<React.ReactText[]>([]);
  const [defaultExpandedKeys, setDefaultExpandedKeys] = useState<
    React.ReactText[]
  >([]);
  const [{ elementTreeData }] = useRecoilState(bimfacePageState);
  useEffect(() => {
    const ids: string[] = [];
    setData(elementTreeData?.map((node) => toTreeDataNode(node, ids)) || []);
    setSelectedKeys(ids);
    setDefaultExpandedKeys(elementTreeData?.map((node) => node.id!) || []);
  }, [elementTreeData]);
  const onCheck = (
    keys:
      | React.ReactText[]
      | { checked: React.ReactText[]; halfChecked: React.ReactText[] },
  ) => {
    fileIdList.forEach((fileId) => {
      view3d?.current?.getModel(fileId).hideAllComponents();
      view3d?.current?.getModel(fileId).showComponentsById(keys);
    });
    view3d?.current?.render();
    setSelectedKeys(Array.isArray(keys) ? keys : keys.checked);
  };

  const onSelectTree = (
    key: React.ReactText[],
    info: {
      event: "select";
      selected: boolean;
      node: EventDataNode & DataNode & TreeNode;
      selectedNodes: DataNode[];
      nativeEvent: MouseEvent;
    },
  ) => {
    if (key.length === 1 && info.node.type === "Element") {
      view3d?.current?.setSelectedComponentsById(key);
      view3d?.current?.zoomToSelectedComponents();
    }
  };
  return (
    <Collapse
      activeKey={activeKey}
      bordered={false}
      className="preview-tree-collapse"
      onChange={() => !activeKey && setActiveKey("1")}
      expandIcon={(panelProps) =>
        panelProps.isActive ? (
          <UnorderedListOutlined />
        ) : (
          <Tooltip placement="right" title="展开">
            <UnorderedListOutlined style={{ padding: 8, marginLeft: -8 }} />
          </Tooltip>
        )
      }
    >
      <Collapse.Panel
        header={
          <div className="preview-tree-title">
            <span>目录树</span>
            <span className="hide-button" onClick={() => setActiveKey("")}>
              <DoubleLeftOutlined />
              收起
            </span>
          </div>
        }
        key="1"
      >
        {data.length > 0 && (
          <Tree
            height={500}
            className="dark-tree"
            checkable
            defaultExpandedKeys={defaultExpandedKeys}
            treeData={data}
            onCheck={onCheck}
            checkedKeys={selectedKeys}
            onSelect={onSelectTree}
           />
        )}
      </Collapse.Panel>
    </Collapse>
  );
};
export default ElementTree;
