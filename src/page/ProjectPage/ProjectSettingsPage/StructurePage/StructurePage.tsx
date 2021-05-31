import React, { useContext, useEffect, useCallback } from "react";
import { Switch, Route, useRouteMatch } from "react-router";
import { ProjectParams } from "model/route-params.model";
import useBreadCrumbs from "hook/use-breadcrumb.hook";
import { useRecoilState } from "recoil";
import { Link } from "react-router-dom";
import { useImmer } from "use-immer";

import { Input, Tree, Button, Tooltip, Modal } from "antd";
import { CodepenOutlined } from "@ant-design/icons";
import { DataNode } from "rc-tree/lib/interface";
import "./StructurePage.scss";

import { structureService } from "service";
import Loading from "component/Loading";
import { CategoryNode, SuiteSearchCondition } from "service/structure.service";
import { SuiteMetaBean } from "api-struc/generated/model";
import { useRequest } from "@umijs/hooks";
import useNavMenu from "hook/use-nav-menu.hook";
import { NAV } from "consts";
import { refreshTemplates } from "three-engine/request/bimmodel/projecttemplatesapi";
import { publishEvent } from "function/stats.func";
import { CheckPermission } from "component/CheckPermission/CheckPermission";
import { ResourcePermissionResourceEnum } from "api-authorization/generated/model";
import { TooltipWrapper } from "component/wrapper/TooltipWrapper";
import SuiteListPage from "./SuiteListPage";
import { StructDetailModal } from "./StructDetailModal";
import SelectStructModal from "./SelectStrucModal";

interface StructurePageProps {}

interface State {
  text: string;
  hasPreset: boolean;
  showModal: boolean;
  condition: SuiteSearchCondition;
  selectedSuite: SuiteMetaBean | null;
}

export default function StructurePage(props: StructurePageProps) {
  const {} = props;
  const {
    url,
    path,
    params: { projectId },
  } = useRouteMatch<ProjectParams>();

  const [
    { condition, showModal, selectedSuite, text, hasPreset },
    updateState,
  ] = useImmer<State>({
    text: "",
    showModal: false,
    selectedSuite: null,
    condition: { categoryId: 0, keyword: "" },
    hasPreset: false,
  });

  useNavMenu(NAV.settingsGouJianKu);

  const { breadCrumbs } = useBreadCrumbs(
    "项目构件库",
    "project-structure",
    url,
  );

  const loader = () => structureService.getProjectCategories(projectId);

  const { loading, data: treeData, run } = useRequest(loader, {
    manual: true,
  });

  useEffect(() => {
    run();

    structureService.checkHasPreset(projectId).then((bol) => {
      updateState((draft) => {
        draft.hasPreset = bol;
      });
    });
  }, []);

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

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="structure-page">
      <div className="header">
        <div className="title">项目构件库</div>
        <div className="sub-title">
          对项目构件进行统一的配置和管理，保证各个团队在协同过程中的设计一致性。
        </div>
      </div>

      <div className="body">
        <div className="sider">
          <Tree
            defaultExpandAll
            selectedKeys={[condition.categoryId]}
            blockNode
            treeData={treeData?.map(toTreeDataNode)}
            onSelect={(keys, info) => {
              if (keys.length > 0) {
                updateState((draft) => {
                  draft.condition = {
                    categoryId: keys[0],
                    keyword: "",
                  };
                  draft.text = "";
                });
              }
            }}
          />
        </div>

        <div className="detail">
          <div className="filter-zone">
            <div className="search-zone">
              <Button
                type="primary"
                style={{ marginRight: 12 }}
                onClick={() =>
                  updateState((draft) => {
                    draft.showModal = true;
                  })
                }
              >
                从公共库添加
              </Button>

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
                      keyword: val,
                      categoryId: 0,
                    };
                  });
                }}
                placeholder="搜索构件名称"
                style={{ width: 230 }}
              />
            </div>

            <div className="btn-zone">
              {hasPreset ? (
                <span style={{ opacity: 0.25 }}>
                  <CodepenOutlined style={{ marginRight: 4 }} />
                  添加预设构件
                </span>
              ) : (
                <CheckPermission
                  resouseType={ResourcePermissionResourceEnum.GJK}
                >
                  <TooltipWrapper
                    when={(tooltipWrapperProps) =>
                      tooltipWrapperProps.disabled ?? false
                    }
                    title="处于示例项目中无该功能权限"
                    defaultTitle="添加一批预设构件，保证基本的功能使用"
                  >
                    <Button
                      type="link"
                      onClick={() => {
                        Modal.confirm({
                          title: "确认添加全部预设构件吗？",
                          async onOk() {
                            return structureService
                              .addPresetToProject(projectId)
                              .then((data) => {
                                const suitesAdded = data?.data;
                                if (
                                  suitesAdded instanceof Array &&
                                  suitesAdded.length > 0
                                ) {
                                  run();
                                  updateState((draft) => {
                                    draft.hasPreset = true;
                                  });
                                } else {
                                  Modal.info({
                                    title: "非常抱歉，暂无可用预设构件可载入",
                                    content: null,
                                    onOk() {},
                                  });
                                }
                              })
                              .finally(() => {
                                publishEvent(
                                  `addComponent`,
                                  ["项目配置", `通用配置`],
                                  {
                                    eventLevel: "P1",
                                    from: "预设构件",
                                  },
                                );
                              });
                          },
                          okText: "确定",
                          cancelText: "关闭",
                        });
                      }}
                    >
                      <CodepenOutlined style={{ marginRight: 4 }} />
                      添加预设构件
                    </Button>
                  </TooltipWrapper>
                </CheckPermission>
              )}
            </div>
          </div>
          <SuiteListPage
            source="project"
            condition={condition}
            setSelSuite={(newSelectedSuite: SuiteMetaBean) =>
              updateState((draft) => {
                draft.selectedSuite = newSelectedSuite;
              })
            }
          />
        </div>
      </div>

      <SelectStructModal
        visible={showModal}
        onCancel={() => {
          updateState((draft) => {
            draft.showModal = false;
          });
          run();
        }}
      />

      <StructDetailModal
        selSuite={selectedSuite}
        onRefresh={() => run()}
        onCancel={() =>
          updateState((draft) => {
            draft.selectedSuite = null;
          })
        }
      />
    </div>
  );
}
