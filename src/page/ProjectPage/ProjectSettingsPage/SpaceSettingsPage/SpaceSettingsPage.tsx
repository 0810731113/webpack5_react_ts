import React, { useEffect, useCallback, useContext, useState } from "react";
import { Switch, Route, useRouteMatch, Prompt } from "react-router";
import { ProjectParams } from "model/route-params.model";
import { Link } from "react-router-dom";
import { useImmer } from "use-immer";
import { Button, Checkbox, Space, Tree, message, Modal } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import { DataNode } from "rc-tree/lib/interface";
import "./SpaceSettingsPage.scss";
import { spaceSettingsService } from "service";
import { SpaceTreeNode } from "service/space-settings.service";
import Loading from "component/Loading";
import {
  modifySpaceNode,
  addChildSpaceNode,
  deleteSpaceNode,
  addNextSpaceNode,
  checkDuplicateName,
  findSpaceNodeById,
  SpaceSearchResult,
} from "function/space.func";
import { useRequest } from "@umijs/hooks";
import useNavMenu from "hook/use-nav-menu.hook";
import { NAV } from "consts";
import {
  LeaveConfirmText,
  confirmWindow,
} from "component/LeaveConfirm/default";
import { Draft } from "immer";
import { CheckPermission } from "component/CheckPermission/CheckPermission";
import {
  ResourcePermissionResourceEnum,
  ResourcePermissionPermissionTypesEnum,
} from "api-authorization/generated/model";
import { TooltipWrapper } from "component/wrapper/TooltipWrapper";
import { onResponseError } from "function/auth.func";
import SpaceNodeDetail from "./SpaceNodeDetail";
import SpaceSettingPageContext from "./SpaceSettingPageContext";

interface SpaceSettingsPageProps {}

export interface SpaceSettingsPageState {
  nodes: SpaceTreeNode[];
  selectedNodeId: string;
  editMode: boolean;
  selectedNodeInfo: SpaceSearchResult | null;
  version: number;
}

export default function SpaceSettingsPage(props: SpaceSettingsPageProps) {
  const {} = props;
  const [
    { nodes, selectedNodeId, selectedNodeInfo, editMode, version },
    updateState,
  ] = useImmer<SpaceSettingsPageState>({
    nodes: [],
    selectedNodeId: "",
    editMode: false,
    selectedNodeInfo: null,
    version: 0,
  });
  const {
    url,
    path,
    params: { projectId },
  } = useRouteMatch<ProjectParams>();

  useNavMenu(NAV.settingsKongJianBiaoGao);

  const loader = () =>
    spaceSettingsService.get(projectId).then((res) => {
      const nodes = res.data;
      if (nodes) {
        updateState((draft) => {
          draft.nodes = nodes;
          if (selectedNodeId) {
            updateSelectedInfo(draft);
          } else {
            draft.selectedNodeId = nodes[0].id;
          }
        });
      } else {
        addChildNode("Root"); // 如果拿到空，置入默认值
      }
      updateState((draft) => {
        draft.version = res.version ?? 0;
      });
    });

  const { data, loading, run } = useRequest<any>(loader, {
    manual: true,
  });

  useEffect(() => {
    if (editMode === false) {
      run();
    }
  }, [editMode]);

  useEffect(() => {
    updateState((draft) => {
      updateSelectedInfo(draft);
    });
  }, [selectedNodeId]);

  function updateSelectedInfo(draft: Draft<SpaceSettingsPageState>) {
    if (selectedNodeId) {
      const info = findSpaceNodeById(selectedNodeId, draft);
      draft.selectedNodeInfo = info;
    } else {
      draft.selectedNodeInfo = null;
    }
  }

  function toTreeDataNode(node: SpaceTreeNode): DataNode {
    if (node.spaceType === "Region") {
      return {
        title: <span>{node.spaceName}</span>,
        key: node.id,
      };
    } 
      return {
        title: <span>{node.spaceName}</span>,
        key: node.id,
        children: !node.subSpaces
          ? undefined
          : node.subSpaces.map(toTreeDataNode),
      };
    
  }

  async function saveConfig() {
    if (checkDuplicateName(nodes)) {
      alert("同一层级下，存在同名元素");
    } else {
      try {
        const version = await spaceSettingsService.update(projectId, nodes);
        message.success("应用成功，已为您推送至工具端");
        updateState((draft) => {
          draft.editMode = false;
          draft.version = version ?? 0;
        });
      } catch (error) {
        onResponseError(error);
      }
    }
  }

  const addChildNode = (parentId: string) => {
    updateState((draft) => {
      const newId = addChildSpaceNode(parentId, draft);
      draft.selectedNodeId = newId;
    });
  };

  const addNextNode = (parentId: string) => {
    updateState((draft) => {
      const newId = addNextSpaceNode(parentId, draft);
      draft.selectedNodeId = newId;
    });
  };

  const modifyNode = (newNode: SpaceTreeNode) => {
    updateState((draft) => {
      const thisNode = modifySpaceNode(newNode, draft);

      if (selectedNodeId === newNode.id) {
        draft.selectedNodeInfo = thisNode;
      }
    });
  };

  const deleteNode = (id: string) => {
    updateState((draft) => {
      deleteSpaceNode(id, draft);
      draft.selectedNodeId = "";
    });
  };

  if (loading) {
    return <Loading />;
  } 
    return (
      <div className="space-page">
        <div className="header">
          空间和标高
          {/* <span>{editMode ? "空间标准 [编辑模式]" : "空间标准"}</span> */}
        </div>

        <Prompt when={editMode} message={LeaveConfirmText} />

        <SpaceSettingPageContext.Provider
          value={{ nodes, addChildNode, addNextNode, modifyNode, deleteNode }}
        >
          <div className="body">
            <div className="sider">
              <div className="title">
                <MenuOutlined /> 空间列表
              </div>
              {editMode && (
                <div className="action-btns">
                  {/* <Button
                    onClick={() =>
                      updateState((draft) => {
                        addChildSpaceNode("Root", draft.nodes);
                      })
                    }
                  >
                    新场地
                  </Button> */}
                  <Button
                    onClick={() => addNextNode(selectedNodeId)}
                    disabled={!selectedNodeInfo}
                  >
                    添加同级空间
                  </Button>
                  <Button
                    onClick={() => addChildNode(selectedNodeId)}
                    disabled={
                      selectedNodeInfo
                        ? selectedNodeInfo.node.spaceType === "Region"
                        : true
                    }
                  >
                    添加子空间
                  </Button>
                  <Button
                    danger
                    onClick={() => deleteNode(selectedNodeId)}
                    disabled={
                      selectedNodeInfo ? selectedNodeInfo.isOnlyChild : true
                    }
                  >
                    删除空间
                  </Button>
                </div>
              )}
              <Tree
                blockNode
                defaultExpandAll
                treeData={nodes.map(toTreeDataNode)}
                selectedKeys={[selectedNodeId]}
                onSelect={(keys, info) => {
                  if (keys.length > 0) {
                    updateState((draft) => {
                      draft.selectedNodeId = keys[0].toString();
                    });
                  }
                }}
              />
            </div>

            <SpaceNodeDetail info={selectedNodeInfo} editMode={editMode} />
          </div>
        </SpaceSettingPageContext.Provider>

        <div className="footer">
          {editMode ? (
            <Space size="middle">
              <span>
                空间和标高版本：<span className="editing-text">（编辑中）</span>
              </span>
              <CheckPermission
                resouseType={ResourcePermissionResourceEnum.ProjectSetting}
              >
                <TooltipWrapper
                  when={(props) => props.disabled ?? false}
                  title="处于示例项目中无该功能权限"
                >
                  <Button type="primary" onClick={saveConfig}>
                    应用
                  </Button>
                </TooltipWrapper>
              </CheckPermission>

              <Button
                type="primary"
                ghost
                onClick={() => {
                  confirmWindow(() => {
                    updateState((draft) => void (draft.editMode = false));
                  });
                }}
              >
                取消
              </Button>
            </Space>
          ) : (
            <Space size="middle">
              <span>空间和标高版本：V{version}</span>
              <CheckPermission
                resouseType={ResourcePermissionResourceEnum.ProjectSetting}
                writeCondition={(rights) =>
                  rights?.includes(
                    ResourcePermissionPermissionTypesEnum.SoftWrite,
                  ) ?? false
                }
              >
                <Button
                  type="primary"
                  onClick={() =>
                    updateState((draft) => void (draft.editMode = true))
                  }
                >
                  编辑
                </Button>
              </CheckPermission>
            </Space>
          )}
        </div>
      </div>
    );
  
}
