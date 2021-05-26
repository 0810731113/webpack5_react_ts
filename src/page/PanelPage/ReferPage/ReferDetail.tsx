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
}
const ReferDetail = (props: ReferDetailMiniProps) => {
  const { dataSet, version, onCommit, ...rest } = props;
  const { treeData, loading } = useClassificationTree(dataSet?.specialtyId);
  const [{ filterType, checkedKeys }, update] = useImmer<ReferDetailMiniState>({
    filterType: "1",
    checkedKeys: [],
  });
  console.log(treeData, filterType);
  useEffect(() => {
    update((draft) => {
      draft.checkedKeys = version?.checkedDataCodeKeys ?? [];
    });
  }, [version]);
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
      <Row className="refer-title">
        <span key="titleLabel">正在链接：</span>
        <span key="titleTeam">{dataSet?.team?.name}</span>
        <span key="titleDataSet">.{dataSet?.name}</span>
        <span key="titleVersion">
          .V
          {version?.displayVersion}
        </span>
      </Row>
      <Row className="action-row">
        <PanelTabTitle
          key="label"
          title="选择参照构件"
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
      <Row className="filter-row">
        <span className="filter-label" key="label">
          筛选：
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
      <Row>
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
    </Drawer>
  );
};
export default ReferDetail;
