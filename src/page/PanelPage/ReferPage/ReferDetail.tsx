import React, { useEffect, Fragment, MutableRefObject, ReactText } from "react";
import { Typography, Drawer, Divider, Button, Row, Tree } from "antd";
import PanelTabTitle from "component/PanelTabTitle";
import { Select, SelectOption } from "component/Antd";
import { timeago } from "function/date.func";
import { useImmer } from "use-immer";
import { VersionVO, DataSetVO, Team, DataSet } from "api/generated/model";
import {
  NumberParam,
  withDefault,
  useQueryParams,
  BooleanParam,
} from "use-query-params";
import { ArrowLeftOutlined, CloseCircleOutlined } from "@ant-design/icons";
import "./ReferPage.scss";
import Loading from "component/Loading";
import { DrawerProps } from "antd/lib/drawer";
import { useClassificationTree } from "hook/use-classification.hook";
import { DataNode } from "rc-tree/lib/interface";
import { DataCode } from "api-bimcode/generated/model";
import { workUnitService } from "service";
import { ReferedVersionVO } from ".";

const { Title, Text } = Typography;
const ReferTypes = [{ key: "1", label: "按构件类型筛选" }];
interface ReferDetailMiniProps extends DrawerProps {
  version?: ReferedVersionVO;
  dataSet?: DataSetVO;
  onCommit: (checkedKeys: ReactText[]) => void;
}
interface ReferDetailMiniState {
  filterType?: string;
  checkedKeys: ReactText[];
  viewTreeData: DataNode[];
}

const ReferDetail = (props: ReferDetailMiniProps) => {
  const { dataSet, version, onCommit, ...rest } = props;
  const { treeData, loading } = useClassificationTree(dataSet?.specialtyId);
  const [{ filterType, checkedKeys, viewTreeData }, update] =
    useImmer<ReferDetailMiniState>({
      filterType: "1",
      checkedKeys: [],
      viewTreeData: [],
    });
  useEffect(() => {
    update((draft) => {
      draft.checkedKeys = version?.checkedDataCodeKeys ?? ["all"];
    });
  }, [version, treeData]);
  useEffect(() => {
    update((draft) => {});
  }, [version, viewTreeData]);
  // const { issue, loading } = useReferDetail(issueId);
  // const currentUnit =
  //   (issue &&
  //     issue.issueDatasets &&
  //     issue.issueDatasets.find((unit) => unit.isCurrent)) ||
  //   {};
  // const setCamera = () => {};
  // if (loading) {
  //   return <Loading absolute />;
  // }
  return (
    <Drawer
      className="issue-detail-drawer refer-detail"
      placement="right"
      width="100%"
      closeIcon={
        <a>
          <ArrowLeftOutlined />
          返回
        </a>
      }
      getContainer={false}
      style={{ position: "absolute" }}
      {...rest}
    >
      <Row className="action-row">
        <PanelTabTitle
          key="label"
          title={
            <span className="refer-title">
              <span key="titleLabel">正在参照&quot;</span>
              <span key="titleTeam">{dataSet?.team?.name}</span>
              <span key="titleDataSet">.{dataSet?.name}</span>
              <span key="titleVersion">.{version?.displayVersion}</span>&quot;
            </span>
          }
          actions={
            <Button
              key="button"
              size="small"
              type="primary"
              disabled={checkedKeys.length === 0}
              onClick={() => onCommit(checkedKeys)}
            >
              完成
            </Button>
          }
        />
      </Row>
      <div className="refers-filter">
        <div className="refer">
          <Row className="filter-row border-row">
            <span className="filter-label" key="label">
              选择模型
            </span>
            <Select
              key="select"
              className="type-filter"
              value={filterType}
              onChange={(value) =>
                update((draft) => {
                  draft.filterType = value;
                })
              }
              size="small"
              placeholder="全部"
            >
              {ReferTypes.map((type) => (
                <SelectOption key={type.key} value={type.key}>
                  {type.label}
                </SelectOption>
              ))}
            </Select>
          </Row>
          <Row className="border-row tree-row">
            {filterType === "1" &&
              (loading ? (
                <Loading absolute />
              ) : (
                <Tree
                  onCheck={(newCheckedKeys) => {
                    update((draft) => {
                      draft.checkedKeys = Array.isArray(newCheckedKeys)
                        ? newCheckedKeys
                        : newCheckedKeys.checked;
                    });
                  }}
                  defaultExpandedKeys={["all"]}
                  checkedKeys={checkedKeys}
                  selectable={false}
                  key="tree"
                  checkable
                  treeData={treeData}
                />
              ))}
          </Row>
        </div>
      </div>
    </Drawer>
  );
};
export default ReferDetail;
