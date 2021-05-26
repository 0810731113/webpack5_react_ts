import React, { useEffect, useCallback } from "react";
import { Switch, Route, useRouteMatch } from "react-router";
import { ProjectParams } from "model/route-params.model";
import { Link } from "react-router-dom";
import { useImmer } from "use-immer";
import { Input, Tree, Modal, Button } from "antd";
import { DataNode } from "rc-tree/lib/interface";

// import "./SelectStructModal.scss";
import { structureService } from "service";
import useLoading from "hook/use-loading.hook";
import { CategoryNode, SuiteSearchCondition } from "service/structure.service";
import { SuiteMetaBean } from "api-struc/generated/model";
import { publishEvent } from "function/stats.func";
import { CheckPermission } from "component/CheckPermission/CheckPermission";
import { TooltipWrapper } from "component/wrapper/TooltipWrapper";
import { ResourcePermissionResourceEnum } from "api-authorization/generated/model";
import SuiteListPage from "./SuiteListPage";
import { GJWIframe } from "./StructDetailModal";

interface SelectStructModalProps {
  onCancel: () => void;
  visible: boolean;
}

interface State {
  selectedSuite: SuiteMetaBean | null;
  condition: SuiteSearchCondition;
  exists: boolean;
  isLoading: boolean;
  newName: string;
  text: string;
}

export default function SelectStructModal(props: SelectStructModalProps) {
  const { onCancel, ...rest } = props;
  const [
    { selectedSuite, condition, exists, newName, isLoading, text },
    updateState,
  ] = useImmer<State>({
    selectedSuite: null,
    condition: { categoryId: 0, keyword: "" },
    exists: false,
    newName: "",
    text: "",
    isLoading: false,
  });
  const {
    url,
    path,
    params: { projectId },
  } = useRouteMatch<ProjectParams>();

  const loader = useCallback(() => structureService.getCommonCategories(), []);

  const { loading, data: treeData } = useLoading(loader, undefined, []);

  async function checkExist(itemId: string) {
    const res = await structureService.checkSuiteExistInProject(
      itemId,
      projectId,
    );
    updateState((draft) => {
      draft.exists = res.exists;
      draft.newName = res.name;
    });
  }

  useEffect(() => {
    if (selectedSuite) {
      updateState((draft) => {
        draft.exists = false;
      });
      checkExist(selectedSuite.id! as any);
    }
  }, [selectedSuite]);

  function toTreeDataNode(node: CategoryNode): DataNode {
    return {
      title: (
        <span>
          {node.name}({node.count})
        </span>
      ),
      key: node.id,
      children: !node.children ? undefined : node.children.map(toTreeDataNode),
    };
  }

  function back() {
    updateState((draft) => {
      draft.selectedSuite = null;
    });
  }

  async function doAdd() {
    updateState((draft) => {
      draft.isLoading = true;
    });
    await structureService.addSuiteToProject(
      selectedSuite?.id! as any,
      projectId,
    );
    await checkExist(selectedSuite?.id! as any);
    updateState((draft) => {
      draft.isLoading = false;
    });

    publishEvent(`addComponent`, ["项目配置", "通用配置"], {
      from: "公共库",
      eventLevel: "P1",
    });
  }

  function clickAdd() {
    if (exists) {
      Modal.confirm({
        title: "项目已有同名构件",
        content: (
          <p style={{ color: "#000", fontSize: 14 }}>
            再次添加构件会被重命名为{newName}
          </p>
        ),
        okButtonProps: { ghost: true, type: "primary" },
        okText: "仍然添加",
        cancelText: "取消",
        cancelButtonProps: { type: "primary", ghost: true },
        onOk() {
          doAdd();
        },
      });
    } else {
      doAdd();
    }
  }

  const renderFooter = () => {
    if (!selectedSuite) {
      return null;
    }
    return (
      <div className="content-footer">
        <a onClick={back}>返回</a>
        <div>
          {exists && <span style={{ paddingRight: 20 }}>已添加</span>}

          <CheckPermission resouseType={ResourcePermissionResourceEnum.GJK}>
            <TooltipWrapper
              when={(tooltipProps) => tooltipProps.disabled ?? false}
              title="处于示例项目中无该功能权限"
            >
              <Button type="primary" loading={isLoading} onClick={clickAdd}>
                添加到项目
              </Button>
            </TooltipWrapper>
          </CheckPermission>
        </div>
      </div>
    );
  };

  return (
    <Modal
      {...rest}
      footer={renderFooter()}
      destroyOnClose
      maskClosable={false}
      title="从公共库添加"
      wrapClassName={
        selectedSuite ? "structure-modal" : "show-suite structure-modal"
      }
      onCancel={() => {
        onCancel();
        back();
      }}
    >
      {selectedSuite ? (
        <div className="content-container">
          <GJWIframe selSuite={selectedSuite} source="common" />
        </div>
      ) : (
        <div className="content-container">
          <div className="content-body">
            <div className="inner-sider" style={{ paddingTop: 4 }}>
              <Tree
                defaultExpandAll
                blockNode
                selectedKeys={[condition.categoryId]}
                treeData={treeData?.map(toTreeDataNode)}
                onSelect={(keys, info) => {
                  if (keys.length > 0) {
                    updateState((draft) => {
                      draft.text = "";
                      draft.condition = {
                        categoryId: keys[0],
                        keyword: "",
                      };
                    });
                  }
                }}
              />
            </div>

            <div className="content-detail">
              <div className="search-zone">
                <Input.Search
                  value={text}
                  onChange={(e) =>
                    updateState((draft) => {
                      draft.text = e.target.value;
                    })
                  }
                  onSearch={(val) => {
                    updateState((draft) => {
                      draft.condition = {
                        categoryId: 0,
                        keyword: val,
                      };
                    });
                  }}
                  placeholder="搜索"
                  style={{ width: 160 }}
                  size="small"
                />
              </div>
              <SuiteListPage
                source="common"
                condition={condition}
                setSelSuite={(_selectedSuite: SuiteMetaBean) =>
                  updateState((draft) => {
                    draft.selectedSuite = _selectedSuite;
                  })
                }
              />
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
